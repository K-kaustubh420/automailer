import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  const pass = cookieStore.get('user_pass')?.value;

  if (!email || !pass) return NextResponse.json({ error: 'No Auth' }, { status: 401 });

  const res = await fetch('http://127.0.0.1:8000/emails', {
    headers: { 'x-email': email, 'x-password': pass },
    cache: 'no-store'
  });

  return NextResponse.json(await res.json());
}