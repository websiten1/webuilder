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
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;

  // Always log to console so you can test in development without needing email
  console.log("\n========================================");
  console.log("VERIFICATION LINK (copy this to test):");
  console.log(verifyLink);
  console.log("========================================\n");

  const resend = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL || "WebBuilder <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
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

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  console.log("Resend accepted email, id:", data?.id);
}

export async function sendEditStartedEmail(
  email: string,
  siteName: string,
  description: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/dashboard`;

  console.log(`\n[Email] Edit started for ${email}: ${siteName}`);

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "WebBuilder <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Your website changes are being processed — ${siteName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">WebBuilder</p>
    <div style="margin:32px 0;padding:32px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Your changes are being processed</h1>
      <p style="color:rgba(255,255,255,0.55);margin:0 0 20px;font-size:14px;line-height:1.6;">
        Your €15 edit was approved. We're applying the changes to your website now. This usually takes 1–2 minutes.
      </p>
      <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;">Website</p>
        <p style="margin:0;font-weight:600;">${siteName}</p>
        <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.55);">${description}</p>
      </div>
      <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">View Dashboard</a>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error("Edit started email error:", error.message);
}

export async function sendEditCompletedEmail(
  email: string,
  siteName: string,
  description: string,
  siteUrl: string,
  githubUrl: string,
  version: number
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const editUrl = `${baseUrl}/dashboard`;

  console.log(`\n[Email] Edit completed for ${email}: ${siteName} v${version}`);

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "WebBuilder <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Your website has been updated! — ${siteName} v${version}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">WebBuilder</p>
    <div style="margin:32px 0;padding:32px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
      <div style="width:48px;height:48px;border-radius:50%;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="color:#10b981;font-size:22px;">✓</span>
      </div>
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Your website has been updated!</h1>
      <p style="color:rgba(255,255,255,0.55);margin:0 0 20px;font-size:14px;line-height:1.6;">
        <strong style="color:#fff;">${siteName}</strong> is now live with your changes. Version ${version}.
      </p>
      <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;">Changes applied</p>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">${description}</p>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <a href="${siteUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">View Live Site</a>
        <a href="${githubUrl}" style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:14px;">View Code</a>
        <a href="${editUrl}" style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);padding:12px 20px;border-radius:10px;text-decoration:none;font-size:14px;">Dashboard</a>
      </div>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error("Edit completed email error:", error.message);
}

export async function sendEditFailedEmail(
  email: string,
  siteName: string,
  description: string,
  siteId: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const retryUrl = `${baseUrl}/edit/${siteId}`;

  console.log(`\n[Email] Edit failed for ${email}: ${siteName}`);

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "WebBuilder <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Edit request failed — refund issued for ${siteName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">WebBuilder</p>
    <div style="margin:32px 0;padding:32px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Edit request failed</h1>
      <p style="color:rgba(255,255,255,0.55);margin:0 0 16px;font-size:14px;line-height:1.6;">
        We had trouble applying your changes to <strong style="color:#fff;">${siteName}</strong>. Don't worry — your €15 has been automatically refunded.
      </p>
      <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0 0 20px;">
        Try a simpler or more specific description, or contact us if the issue persists.
      </p>
      <a href="${retryUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Try Again</a>
      <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">
        Questions? Reply to this email or contact support@webbuilder.app
      </p>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error("Edit failed email error:", error.message);
}
