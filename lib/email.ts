import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_placeholder")) {
    throw new Error("RESEND_API_KEY is not configured in .env.local");
  }
  return new Resend(key);
}

export async function sendVerificationCode(
  email: string,
  code: string
): Promise<void> {
  console.log(`\n[OTP] Verification code for ${email}: ${code}\n`);

  const resend = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://insixlive.com";

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: `${code} is your inSIXlive verification code`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>inSIXlive – Verify your email</title>
  <style>
    @media (prefers-color-scheme: dark) {
      body { background: #0a0a0a !important; color: #ffffff !important; }
      .wrapper { background: #1a1a1a !important; }
      .header { border-bottom-color: #2a2a2a !important; }
      .subtitle { color: #b0b0b0 !important; }
      .code-box { background: #2a2a2a !important; border-color: #3a3a3a !important; }
      .code-box code { color: #ffffff !important; }
      .info-box { background: #1f1f1f !important; }
      .info-text { color: #b0b0b0 !important; }
      .info-strong { color: #ffffff !important; }
      .footer { background: #0f0f0f !important; border-top-color: #2a2a2a !important; }
      .footer-muted { color: #808080 !important; }
      .footer-link { color: #FF5A1F !important; }
      .footer-div { color: #333333 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:20px;background:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
  <div style="max-width:600px;margin:0 auto;">
    <div class="wrapper" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <div class="header" style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
        <div style="font-size:40px;font-weight:900;color:#FF5A1F;line-height:1;margin-bottom:8px;">6</div>
        <div style="font-size:20px;font-weight:700;letter-spacing:-0.5px;">inSIXlive</div>
      </div>

      <div style="padding:40px 32px;">
        <h2 style="font-size:28px;font-weight:700;line-height:1.2;margin:0 0 8px;letter-spacing:-0.5px;">Verify your email</h2>
        <p class="subtitle" style="font-size:16px;line-height:1.5;margin:0 0 32px;color:#666666;">
          Enter this code to confirm your identity and get started
        </p>

        <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;opacity:0.7;">Your verification code</p>
        <div class="code-box" style="background:#f5f5f5;border:2px solid #e8e8e8;border-radius:12px;padding:24px;text-align:center;">
          <code style="font-family:'Courier New',monospace;font-size:36px;font-weight:700;letter-spacing:10px;color:#1a1a1a;">${code}</code>
        </div>
        <p style="color:#999999;font-size:12px;margin:12px 0 32px;text-align:center;">This code expires in 15 minutes</p>

        <div class="info-box" style="background:#fafafa;border-radius:8px;padding:20px;margin-bottom:32px;">
          <p class="info-text" style="color:#666666;font-size:14px;line-height:1.6;margin:0;">
            <strong class="info-strong" style="color:#1a1a1a;">Didn't request this?</strong> If you didn't sign up for an inSIXlive account, you can safely ignore this email. Your email address won't be used without your permission.
          </p>
        </div>

        <p style="color:#999999;font-size:13px;line-height:1.6;margin:0;">
          Need help? Contact our support team at <a href="mailto:support@insixlive.com" style="color:#FF5A1F;text-decoration:none;">support@insixlive.com</a>
        </p>
      </div>

      <div class="footer" style="padding:24px 32px;border-top:1px solid #f0f0f0;text-align:center;background:#fafafa;">
        <p class="footer-muted" style="color:#999999;font-size:12px;line-height:1.5;margin:0 0 12px;">© 2026 inSIXlive. All rights reserved.</p>
        <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
          <a href="${baseUrl}/privacy" class="footer-link" style="color:#FF5A1F;text-decoration:none;font-size:12px;">Privacy Policy</a>
          <span class="footer-div" style="color:#dddddd;">•</span>
          <a href="${baseUrl}/terms" class="footer-link" style="color:#FF5A1F;text-decoration:none;font-size:12px;">Terms of Service</a>
          <span class="footer-div" style="color:#dddddd;">•</span>
          <a href="mailto:support@insixlive.com" class="footer-link" style="color:#FF5A1F;text-decoration:none;font-size:12px;">Contact Support</a>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`,
  });

  if (error) {
    console.error("Resend error (code):", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
  console.log("Code email sent, id:", data?.id);
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;
  console.log("\n[Legacy link] Verification link:", verifyLink, "\n");

  const resend = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: "Verify your email — inSIXlive",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">inSIXlive</p>
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
  const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Your website changes are being processed — ${siteName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">inSIXlive</p>
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
  const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Your website has been updated! — ${siteName} v${version}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">inSIXlive</p>
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
  const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Edit request failed — refund issued for ${siteName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">inSIXlive</p>
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
        Questions? Reply to this email or contact support@insixlive.com
      </p>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error("Edit failed email error:", error.message);
}

export async function sendParishCalendarSetupEmail(
  email: string,
  params: {
    siteName: string;
    adminUrl: string;
    adminEmail: string;
    tempPassword: string;
    vercelProjectName: string;
  }
): Promise<void> {
  const { siteName, adminUrl, adminEmail, tempPassword, vercelProjectName } = params;
  const storageTabUrl = `https://vercel.com/dashboard/stores?filter=${encodeURIComponent(vercelProjectName)}`;

  console.log(`\n[Email] Parish calendar setup for ${email}: ${siteName}`);

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `One step left to activate your editable weekly schedule — ${siteName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">inSIXlive</p>
    <div style="margin:32px 0;padding:32px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Your editable weekly schedule is almost ready</h1>
      <p style="color:rgba(255,255,255,0.55);margin:0 0 20px;font-size:14px;line-height:1.6;">
        ${siteName} now includes a "This Week" schedule page you can update yourself — no code, no redeploys. One quick one-time setup step is needed first.
      </p>
      <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;">Step 1 — connect storage (about 2 minutes)</p>
        <ol style="margin:0;padding-left:18px;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;">
          <li>Open your project's Storage tab: <a href="${storageTabUrl}" style="color:#a855f7;">${storageTabUrl}</a></li>
          <li>Click "Create Database" → choose "Blob" → name it anything.</li>
          <li>Connect it to the <b>${vercelProjectName}</b> project.</li>
        </ol>
      </div>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;">Step 2 — log in once storage is connected</p>
        <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.55);">Admin URL: <a href="${adminUrl}" style="color:#a855f7;">${adminUrl}</a></p>
        <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.55);">Email: <b style="color:#fff;">${adminEmail}</b></p>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.55);">Temporary password: <b style="color:#fff;">${tempPassword}</b></p>
      </div>
      <p style="margin:0 0 20px;font-size:12px;color:rgba(255,255,255,0.4);">You'll be asked to set a new password the first time you log in. If you log in before Step 1 is done, it just won't work yet — finish the storage step and try again.</p>
      <a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Open admin login</a>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error("Parish calendar setup email error:", error.message);
}
