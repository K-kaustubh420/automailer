import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value;
  const userPass = cookieStore.get('user_pass')?.value; // This is the App Password

  if (!userEmail || !userPass) {
    return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
  }

  try {
    const { to, subject, body } = await req.json();

    // 1. Setup Nodemailer Transporter using user's own credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userEmail,
        pass: userPass,
      },
    });

    // 2. Configure the email
    const mailOptions = {
      from: `Automailer AI <${userEmail}>`,
      to: to,
      subject: subject,
      text: body,
    };

    // 3. Send it
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Nodemailer Error:", error);
    return NextResponse.json({ error: 'Failed to send email. Check App Password.' }, { status: 500 });
  }
}