import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all audits associated with either the user's ID or the user's email address
    const res = await query(
      `SELECT 
        id, 
        public_token, 
        created_at, 
        team_size, 
        primary_use_case, 
        total_monthly_spend, 
        total_monthly_savings, 
        total_annual_savings,
        ai_summary
      FROM audits 
      WHERE user_id = $1 OR email = $2
      ORDER BY created_at DESC`,
      [session.userId, session.email]
    );

    interface AuditRow {
      id: string;
      public_token: string;
      created_at: string;
      team_size: number;
      primary_use_case: string;
      total_monthly_spend: string | number;
      total_monthly_savings: string | number;
      total_annual_savings: string | number;
      ai_summary: string | null;
    }

    const audits = (res.rows as AuditRow[]).map((row) => ({
      id: row.id,
      publicToken: row.public_token,
      createdAt: row.created_at,
      teamSize: row.team_size,
      primaryUseCase: row.primary_use_case,
      totalMonthlySpend: Number(row.total_monthly_spend),
      totalMonthlySavings: Number(row.total_monthly_savings),
      totalAnnualSavings: Number(row.total_annual_savings),
      aiSummary: row.ai_summary,
    }));

    return NextResponse.json({ audits });
  } catch (err) {
    console.error('Fetch user audits error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to retrieve audits', details: message }, { status: 500 });
  }
}
