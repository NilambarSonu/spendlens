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
    let teamSize = 1;
    let primaryUseCase = 'general';

    const hasDb = !!process.env.DATABASE_URL;

    if (hasDb) {
      try {
        const res = await query(
          `UPDATE audits 
           SET 
             email = $1, 
             company_name = $2, 
             role = $3, 
             lead_captured_at = $4 
           WHERE id = $5 
           RETURNING total_monthly_savings, total_annual_savings, team_size, primary_use_case`,
          [email, companyName || null, role || null, new Date(), auditId]
        );

        if (res.rowCount === 0) {
          return NextResponse.json({ error: 'Audit record not found' }, { status: 404 });
        }

        const row = res.rows[0];
        totalMonthlySavings = Number(row.total_monthly_savings);
        totalAnnualSavings = Number(row.total_annual_savings);
        teamSize = Number(row.team_size);
        primaryUseCase = row.primary_use_case;
      } catch (dbErr) {
        console.error('DB update error in lead capture:', dbErr);
      }
    } else {
      totalMonthlySavings = 320;
      totalAnnualSavings = 3840;
    }

    // ── Resend email dispatch ──────────────────────────────────────────────
    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      console.warn('[Resend] RESEND_API_KEY not set — skipping email.');
    } else {
      try {
        const resend = new Resend(resendKey);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendlens.nilambarsonu.me';
        // Resend free tier allows sending from onboarding@resend.dev to any address
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const auditUrl = `${appUrl}/audit/${publicToken}`;

        console.log(`[Resend] Sending audit report email to ${email}...`);

        const emailResult = await resend.emails.send({
          from: `SpendLens <${fromEmail}>`,
          to: email,
          subject: `💰 You could save $${totalMonthlySavings}/mo on AI tools — SpendLens Report`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your SpendLens AI Audit Report</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0a2e 0%,#16082a 50%,#0d1a2e 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;border:1px solid #2d1b4e;border-bottom:none;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.4);border-radius:12px;padding:10px 14px;">
                      <span style="font-size:20px;font-weight:900;color:#c084fc;letter-spacing:-0.5px;">S</span>
                    </div>
                    <span style="font-size:20px;font-weight:800;color:#ffffff;margin-left:12px;vertical-align:middle;">SpendLens</span>
                    <span style="font-size:10px;font-weight:700;color:#6b7280;margin-left:6px;vertical-align:middle;letter-spacing:2px;text-transform:uppercase;">BY CREDEX</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:28px;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:#a855f7;text-transform:uppercase;letter-spacing:2px;">✦ AI SPEND AUDIT COMPLETE</p>
                    <h1 style="margin:12px 0 0;font-size:32px;font-weight:900;color:#ffffff;line-height:1.2;">
                      Your AI stack audit<br/>is ready.
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Savings Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#581c87,#1e3a5f);padding:32px 40px;border-left:1px solid #2d1b4e;border-right:1px solid #2d1b4e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="text-align:center;background:rgba(0,0,0,0.3);border-radius:16px;padding:20px;border:1px solid rgba(168,85,247,0.3);">
                    <p style="margin:0;font-size:12px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:1.5px;">Monthly Savings</p>
                    <p style="margin:8px 0 0;font-size:36px;font-weight:900;color:#ffffff;">$${totalMonthlySavings.toFixed(0)}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">per month identified</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="text-align:center;background:rgba(0,0,0,0.3);border-radius:16px;padding:20px;border:1px solid rgba(34,211,238,0.3);">
                    <p style="margin:0;font-size:12px;font-weight:700;color:#22d3ee;text-transform:uppercase;letter-spacing:1.5px;">Annual Savings</p>
                    <p style="margin:8px 0 0;font-size:36px;font-weight:900;color:#ffffff;">$${totalAnnualSavings.toFixed(0)}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">per year potential</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#111118;padding:36px 40px;border-left:1px solid #1f2937;border-right:1px solid #1f2937;">
              <p style="margin:0 0 20px;font-size:16px;color:#d1d5db;line-height:1.7;">
                Hi${companyName ? ` from <strong style="color:#c084fc;">${companyName}</strong>` : ''},
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#d1d5db;line-height:1.7;">
                SpendLens has analyzed your AI tool subscriptions and found 
                <strong style="color:#c084fc;">$${totalMonthlySavings.toFixed(0)}/month</strong> in optimization opportunities — 
                that's <strong style="color:#22d3ee;">$${totalAnnualSavings.toFixed(0)}/year</strong> you could redirect toward growth.
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:#9ca3af;line-height:1.7;">
                Your full breakdown — including per-tool recommendations, confidence scores, and projected savings — is waiting for you:
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${auditUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:800;font-size:16px;letter-spacing:0.3px;box-shadow:0 8px 32px rgba(168,85,247,0.35);">
                      View Full Audit Report →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#6b7280;text-align:center;">
                Or paste this link: <a href="${auditUrl}" style="color:#a855f7;text-decoration:underline;font-size:12px;word-break:break-all;">${auditUrl}</a>
              </p>
            </td>
          </tr>

          ${totalMonthlySavings > 200 ? `
          <!-- High Savings Bonus Block -->
          <tr>
            <td style="background:#0d1f0d;padding:24px 40px;border-left:1px solid #1f2937;border-right:1px solid #1f2937;border-top:1px solid #14532d;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:12px;padding:20px;">
                    <p style="margin:0;font-size:15px;font-weight:700;color:#4ade80;">💡 You qualify for Credex bulk credits</p>
                    <p style="margin:10px 0 0;font-size:14px;color:#86efac;line-height:1.6;">
                      Your team's AI spend qualifies you for up to 40% savings on API tokens and subscriptions via Credex bulk credits.
                      <a href="https://credex.rocks" style="color:#4ade80;font-weight:700;text-decoration:underline;">Book a free 15-min consult →</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="background:#0a0a0f;border-radius:0 0 20px 20px;padding:28px 40px;border:1px solid #1f2937;border-top:1px solid #1f2937;">
              <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;line-height:1.8;">
                Sent by <a href="https://spendlens.nilambarsonu.me" style="color:#6b7280;text-decoration:underline;">SpendLens</a> · 
                Powered by <a href="https://credex.rocks" style="color:#6b7280;text-decoration:underline;">Credex</a> · 
                AI Credits Marketplace
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#374151;text-align:center;">
                You're receiving this because you ran a free AI spend audit.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });

        console.log(`[Resend] Email dispatched successfully! ID: ${emailResult?.data?.id}`);
      } catch (emailErr: any) {
        // Log the error but don't fail the whole request
        console.error('[Resend] Email send failed:', emailErr?.message || emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Lead capture error:', err);
    return NextResponse.json({ error: 'Failed to capture lead details' }, { status: 500 });
  }
}
