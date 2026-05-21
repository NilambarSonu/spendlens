import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Resend } from 'resend';

// Basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { auditId, publicToken, email, companyName, role } = body;

    if (!email || !auditId) {
      return NextResponse.json({ error: 'Email and auditId required' }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    let totalMonthlySavings = 0;
    let totalAnnualSavings = 0;

    const isPlaceholderEnv = !process.env.DATABASE_URL;

    if (isPlaceholderEnv) {
      console.warn('DATABASE_URL is missing. Skipping database update and sending mock confirmation email.');
      // Using mock values for savings
      totalMonthlySavings = 320;
      totalAnnualSavings = 3840;
    } else {
      // Update audit with lead info
      const res = await query(
        `UPDATE audits 
         SET 
           email = $1, 
           company_name = $2, 
           role = $3, 
           lead_captured_at = $4 
         WHERE id = $5 
         RETURNING total_monthly_savings, total_annual_savings`,
        [
          email,
          companyName || null,
          role || null,
          new Date(),
          auditId
        ]
      );

      if (res.rowCount === 0) {
        return NextResponse.json({ error: 'Audit record not found' }, { status: 404 });
      }

      const audit = res.rows[0];
      if (audit) {
        totalMonthlySavings = Number(audit.total_monthly_savings);
        totalAnnualSavings = Number(audit.total_annual_savings);
      }
    }

    const isResendPlaceholder = 
      !process.env.RESEND_API_KEY || 
      process.env.RESEND_API_KEY.includes('placeholder') || 
      !process.env.RESEND_FROM_EMAIL;

    if (isResendPlaceholder) {
      console.warn('Resend API key is placeholder or unset. Skipping real email dispatch.');
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendlens.vercel.app';
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'audit@spendlens.app';

      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Your AI Spend Audit from SpendLens',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 16px; font-weight: 700;">Your SpendLens audit is saved.</h1>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">We analyzed your AI subscription plans and found <strong>$${totalMonthlySavings.toFixed(0)}/month</strong> in potential savings for your team — that's <strong>$${totalAnnualSavings.toFixed(0)}/year</strong>.</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">You can view and share your detailed audit breakdown anytime using the link below:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${appUrl}/audit/${publicToken}" 
                 style="display: inline-block; background: #0f172a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                View Full Audit Details →
              </a>
            </div>
            ${totalMonthlySavings > 500 ? `
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-top: 32px;">
              <p style="color: #166534; margin: 0; font-size: 15px; line-height: 1.6;">
                <strong>💡 You qualify for Credex custom credits.</strong> 
                Since your team has substantial AI tool spending, you can unlock up to 40% in extra savings on API tokens and subscriptions through bulk credits. 
                <a href="https://credex.rocks" style="color: #15803d; font-weight: 700; text-decoration: underline;">Book a free 15-minute optimization consult →</a>
              </p>
            </div>
            ` : ''}
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">SpendLens is a free utility powered by <a href="https://credex.rocks" style="color: #64748b; text-decoration: underline;">Credex</a> · The AI Credits Marketplace</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Lead capture error:', err);
    return NextResponse.json({ error: 'Failed to capture lead details' }, { status: 500 });
  }
}
