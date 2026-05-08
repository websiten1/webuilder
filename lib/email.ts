import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_placeholder")) {
    throw new Error("RESEND_API_KEY is not configured in .env.local");
  }
  return new Resend(key);
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;

  const resend = getResend();
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "WebBuilder <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email — WebBuilder",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">WebBuilder</p>
    <div style="margin:32px 0;padding:32px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
      <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.02em;">Verify your email</h1>
      <p style="color:rgba(255,255,255,0.55);margin:0 0 28px;font-size:15px;line-height:1.6;">
        Thanks for signing up. Click the button below to verify your email address and continue setting up your account.
      </p>
      <a href="${verifyLink}"
         style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
        Verify Email Address
      </a>
      <p style="margin:24px 0 0;color:rgba(255,255,255,0.3);font-size:13px;">
        Or copy this link into your browser:<br>
        <a href="${verifyLink}" style="color:#a5b4fc;word-break:break-all;">${verifyLink}</a>
      </p>
      <p style="margin:16px 0 0;color:rgba(255,255,255,0.25);font-size:12px;">
        This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}
