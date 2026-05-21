import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const res = await query(
      'SELECT id, email, company_name, role FROM users WHERE id = $1',
      [session.userId]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ authenticated: false });
    }

    const user = res.rows[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.company_name,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Auth me session validation error:', err);
    return NextResponse.json({ authenticated: false });
  }
}
