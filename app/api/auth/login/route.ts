import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createSessionToken, getAuthCookieHeader } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('[Auth Login] POST login request initiated.');

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error('[Auth Login] Failed to parse request JSON body:', parseErr);
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { email, password } = body;
    console.log('[Auth Login] Attempting login for email:', email ? email.toLowerCase().trim() : undefined);

    if (!email || !password) {
      console.warn('[Auth Login] Login validation failed: Missing email or password.');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Lookup user in Neon DB
    const emailNormalized = email.toLowerCase().trim();
    console.log(`[Auth Login] Quering Neon Postgres for user: ${emailNormalized}`);
    const res = await query('SELECT * FROM users WHERE email = $1', [emailNormalized]);
    
    if (res.rowCount === 0) {
      console.warn(`[Auth Login] Login rejected: Email not registered: ${emailNormalized}`);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = res.rows[0];
    console.log(`[Auth Login] User located in database. Verifying hashed credentials for UserID: ${user.id}`);

    // Verify hashed password
    const isPasswordValid = verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      console.warn(`[Auth Login] Login rejected: Invalid password provided for: ${emailNormalized}`);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.log('[Auth Login] Hashed password verified successfully. Signing session token...');
    const sessionToken = createSessionToken(user.id, user.email);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.company_name,
        role: user.role,
      }
    });

    response.headers.set('Set-Cookie', getAuthCookieHeader(sessionToken));
    
    const duration = Date.now() - startTime;
    console.log(`[Auth Login] Login completed successfully in ${duration}ms!`);
    return response;
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[Auth Login] Login failed after ${duration}ms with exception:`, err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Login failed', details: message }, { status: 500 });
  }
}

