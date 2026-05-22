import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createSessionToken, getAuthCookieHeader } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('[Auth Register] POST registration request initiated.');
  
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error('[Auth Register] Failed to parse request JSON body:', parseErr);
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { email, password, companyName, role } = body;
    console.log('[Auth Register] Received payload details:', { 
      email: email ? email.toLowerCase().trim() : undefined, 
      companyName, 
      role 
    });

    if (!email || !password) {
      console.warn('[Auth Register] Registration validation failed: Missing email or password.');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      console.warn('[Auth Register] Registration validation failed: Password length is too short (< 6 chars).');
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Check if user already exists
    const emailNormalized = email.toLowerCase().trim();
    console.log(`[Auth Register] Verifying if email is already registered: ${emailNormalized}`);
    const checkRes = await query('SELECT id FROM users WHERE email = $1', [emailNormalized]);
    
    if (checkRes.rowCount && checkRes.rowCount > 0) {
      console.warn(`[Auth Register] Registration failed: Email is already occupied: ${emailNormalized}`);
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Hash password and insert
    console.log('[Auth Register] Hashing password using PBKDF2...');
    const passwordHash = hashPassword(password);
    
    console.log('[Auth Register] Inserting new user record into Neon Postgres...');
    const insertRes = await query(
      `INSERT INTO users (email, password_hash, company_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, company_name, role`,
      [emailNormalized, passwordHash, companyName || null, role || null]
    );

    if (insertRes.rowCount === 0) {
      throw new Error('Database INSERT query did not return any row.');
    }

    const user = insertRes.rows[0];
    console.log(`[Auth Register] Successfully created user in database. UserID: ${user.id}`);
    
    console.log('[Auth Register] Signing secure Session Token...');
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
    console.log(`[Auth Register] Registration completed successfully in ${duration}ms!`);
    return response;
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[Auth Register] Registration failed after ${duration}ms with exception:`, err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Registration failed', details: message }, { status: 500 });
  }
}

