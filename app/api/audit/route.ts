import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { runAudit } from '@/lib/audit-engine';
import { AuditInput } from '@/types';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';

// Rate limiting: simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 }); // 1 min window
    return false;
  }
  if (entry.count >= 30) return true; // Friendly limit for testing
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (body.website) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const input: AuditInput = body.input;

    if (!input || !input.tools || !input.teamSize || !input.primaryUseCase) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    if (input.tools.length > 15) {
      return NextResponse.json({ error: 'Too many tools' }, { status: 400 });
    }

    const auditResult = runAudit(input);
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

    const isPlaceholderEnv = !process.env.DATABASE_URL;

    if (isPlaceholderEnv) {
      console.warn('DATABASE_URL is missing. Returning mock audit response.');
      const mockId = crypto.randomUUID();
      const mockToken = crypto.randomUUID();
      return NextResponse.json({
        auditId: mockId,
        publicToken: mockToken,
        result: auditResult,
      });
    }

    // Resolve user session if authenticated
    const session = getSession(req);
    const userId = session ? session.userId : null;

    // Store in Neon Postgres
    const res = await query(
      `INSERT INTO audits (
        team_size, 
        primary_use_case, 
        tools, 
        total_monthly_spend, 
        total_monthly_savings, 
        total_annual_savings, 
        recommendations, 
        ip_hash, 
        user_agent,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id, public_token`,
      [
        input.teamSize,
        input.primaryUseCase,
        JSON.stringify(input.tools),
        auditResult.totalMonthlySpend,
        auditResult.totalMonthlySavings,
        auditResult.totalAnnualSavings,
        JSON.stringify(auditResult.recommendations),
        ipHash,
        req.headers.get('user-agent')?.slice(0, 200) || null,
        userId,
      ]
    );

    const row = res.rows[0];

    return NextResponse.json({
      auditId: row.id,
      publicToken: row.public_token,
      result: auditResult,
    });
  } catch (err) {
    console.error('Audit creation error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const isPlaceholderEnv = !process.env.DATABASE_URL;

  if (isPlaceholderEnv) {
    console.warn('DATABASE_URL is missing. Returning static mock audit data.');
    return NextResponse.json({
      audit: {
        id: 'mock-id-1234',
        public_token: token,
        created_at: new Date().toISOString(),
        team_size: 5,
        primary_use_case: 'coding',
        tools: [{ toolId: 'cursor', planId: 'business', monthlySpend: 120, seats: 3 }],
        total_monthly_spend: 120,
        total_monthly_savings: 60,
        total_annual_savings: 720,
        recommendations: [
          {
            toolId: 'cursor',
            toolName: 'Cursor',
            currentPlan: 'Business',
            currentSpend: 120,
            action: 'downgrade',
            recommendedPlan: 'Pro',
            projectedSpend: 60,
            monthlySavings: 60,
            annualSavings: 720,
            reasoning: 'Cursor Business features are overkill for a team size of 5. Switch to Pro to save $60/month.',
            confidence: 'high'
          }
        ],
        ai_summary: 'Your team of 5 is spending $120/month on Cursor Business, but could easily save $60/month by right-sizing to Cursor Pro without sacrificing any coding features.'
      }
    });
  }

  try {
    const res = await query(
      `SELECT 
        id, 
        public_token, 
        created_at, 
        team_size, 
        primary_use_case, 
        tools, 
        total_monthly_spend, 
        total_monthly_savings, 
        total_annual_savings, 
        recommendations, 
        ai_summary 
      FROM audits 
      WHERE public_token = $1`,
      [token]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const row = res.rows[0];
    
    // Parse JSON columns safely
    const auditData = {
      id: row.id,
      public_token: row.public_token,
      created_at: row.created_at,
      team_size: row.team_size,
      primary_use_case: row.primary_use_case,
      tools: typeof row.tools === 'string' ? JSON.parse(row.tools) : row.tools,
      total_monthly_spend: Number(row.total_monthly_spend),
      total_monthly_savings: Number(row.total_monthly_savings),
      total_annual_savings: Number(row.total_annual_savings),
      recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations,
      ai_summary: row.ai_summary,
    };

    return NextResponse.json({ audit: auditData });
  } catch (err) {
    console.error('Audit get error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}
