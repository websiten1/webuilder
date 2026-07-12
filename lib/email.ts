import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_placeholder")) {
    throw new Error("RESEND_API_KEY is not configured in .env.local");
  }
  return new Resend(key);
}

const EMAIL_COPY = {
  en: {
    title: "inSIXlive - Verify Your Email",
    heading: "Verify your email",
    subtitle: "Enter this code to confirm your identity and get started",
    codeLabel: "Your verification code",
    expiry: "This code expires in 15 minutes",
    cta: "Enter code at insixlive.com",
    notRequested: "Didn't request this?",
    notRequestedBody:
      "If you didn't sign up for an inSIXlive account, you can safely ignore this email. Your email address won't be used without your permission.",
    support: "Need help? Contact our support team at",
    rights: "All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    prefs: "Email Preferences",
  },
  ro: {
    title: "inSIXlive - Verifică-ți emailul",
    heading: "Verifică-ți emailul",
    subtitle: "Introdu acest cod pentru a-ți confirma identitatea și a începe",
    codeLabel: "Codul tău de verificare",
    expiry: "Acest cod expiră în 15 minute",
    cta: "Introdu codul pe insixlive.com",
    notRequested: "Nu ai solicitat asta?",
    notRequestedBody:
      "Dacă nu ți-ai creat un cont inSIXlive, poți ignora acest email în siguranță. Adresa ta de email nu va fi folosită fără permisiunea ta.",
    support: "Ai nevoie de ajutor? Contactează echipa noastră de suport la",
    rights: "Toate drepturile rezervate.",
    privacy: "Politica de confidențialitate",
    terms: "Termeni și condiții",
    prefs: "Preferințe email",
  },
} as const;

function emailFooter(lang: "en" | "ro", baseUrl: string): string {
  const c = EMAIL_COPY[lang];
  return `
      <div class="footer-section">
        <p class="footer-text">© 2026 inSIXlive. ${c.rights}</p>
        <div class="footer-links">
          <a href="${baseUrl}/privacy?lang=${lang}" class="footer-link">${c.privacy}</a>
          <span class="divider">•</span>
          <a href="${baseUrl}/terms?lang=${lang}" class="footer-link">${c.terms}</a>
          <span class="divider">•</span>
          <a href="${baseUrl}/email-preferences?lang=${lang}" class="footer-link">${c.prefs}</a>
        </div>
      </div>`;
}

const EMAIL_DARK_MODE_CSS = `
    @media (prefers-color-scheme: dark) {
      body { background: #0a0a0a !important; color: #ffffff !important; }
      .email-wrapper { background: #1a1a1a !important; border-color: #2a2a2a !important; }
      .header-text { color: #ffffff !important; }
      .subtitle-text { color: #b0b0b0 !important; }
      .body-text { color: #e0e0e0 !important; }
      .code-digit { background: #2a2a2a !important; border-color: #3a3a3a !important; color: #ffffff !important; }
      .code-digit:nth-child(odd) { border-color: #5a3a2a !important; }
      .cta-button { background: #ff5a00 !important; color: #ffffff !important; }
      .info-box { background: #1f1f1f !important; }
      .footer-section { border-top-color: #2a2a2a !important; background: #0f0f0f !important; }
      .footer-text { color: #808080 !important; }
      .footer-link { color: #ff5a00 !important; }
      .divider { color: #333333 !important; }
    }`;

const EMAIL_BASE_CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f8f8; color: #1a1a1a; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; }
    .email-wrapper { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .brand-bar { height: 4px; background: #ff5a00; }
    .header { padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #f0f0f0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .logo { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin-bottom: 16px; }
    .logo span { font-size: 40px; font-weight: 200; color: #09090b; line-height: 1; letter-spacing: -0.02em; }
    .brand-name { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin: 0; color: #09090b; }
    .content { padding: 40px 32px; }
    .main-heading { font-size: 28px; font-weight: 700; line-height: 1.2; margin-bottom: 8px; letter-spacing: -0.5px; }
    .subtitle { font-size: 16px; line-height: 1.5; margin-bottom: 32px; font-weight: 400; color: #666666; }
    .code-section { margin-bottom: 32px; }
    .code-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; opacity: 0.7; }
    .code-digits { display: flex; justify-content: center; gap: 10px; }
    .code-digit { flex: 1; max-width: 56px; aspect-ratio: 3 / 4; background: #ffffff; border: 2px solid #e8e8e8; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 700; color: #1a1a1a; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .code-digit:nth-child(odd) { border-color: rgba(255,90,0,0.25); }
    .code-expiry { color: #999999; font-size: 12px; margin-top: 12px; text-align: center; }
    .cta-button { display: block; width: 100%; padding: 14px 24px; background: #ff5a00; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; border: none; margin-bottom: 32px; }
    .info-box { background: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 32px; }
    .info-box p { color: #666666; font-size: 14px; line-height: 1.6; margin: 0; }
    .info-box strong { color: #1a1a1a; }
    .support-text { color: #999999; font-size: 13px; line-height: 1.6; margin-bottom: 8px; }
    .support-text a { color: #ff5a00; text-decoration: none; }
    .footer-section { padding: 24px 32px; border-top: 1px solid #f0f0f0; text-align: center; background: #fafafa; }
    .footer-text { color: #999999; font-size: 12px; line-height: 1.5; margin-bottom: 12px; }
    .footer-links { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
    .footer-link { color: #ff5a00; text-decoration: none; font-size: 12px; }
    .divider { color: #ddd; }`;

function buildVerificationEmailHtml(code: string, lang: "en" | "ro", baseUrl: string): string {
  const c = EMAIL_COPY[lang];
  const digits = code
    .split("")
    .map((d) => `<div class="code-digit">${d}</div>`)
    .join("");

  return `<!DOCTYPE html><html lang="${lang}"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <style>${EMAIL_BASE_CSS}${EMAIL_DARK_MODE_CSS}</style>
</head>
<body>
  <div class="email-container">
    <div class="email-wrapper">
      <div class="header">
        <div class="logo"><span>6</span></div>
        <h1 class="header-text brand-name">insixlive</h1>
      </div>
      <div class="brand-bar"></div>
      <div class="content">
        <h2 class="header-text main-heading">${c.heading}</h2>
        <p class="subtitle-text subtitle">${c.subtitle}</p>
        <div class="code-section">
          <p class="body-text code-label">${c.codeLabel}</p>
          <div class="code-digits">${digits}</div>
          <p class="code-expiry">${c.expiry}</p>
        </div>
        <a class="cta-button" href="${baseUrl}/signup">${c.cta}</a>
        <div class="info-box">
          <p><strong>${c.notRequested}</strong> ${c.notRequestedBody}</p>
        </div>
        <p class="support-text">${c.support} <a href="mailto:insixlive@outlook.com">insixlive@outlook.com</a></p>
      </div>
      ${emailFooter(lang, baseUrl)}
    </div>
  </div>
</body></html>`;
}

export async function sendVerificationCode(
  email: string,
  code: string,
  lang: "en" | "ro" = "ro"
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[OTP] Verification code for ${email}: ${code}\n`);
  }

  const resend = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://insixlive.com";

  const subject =
    lang === "ro"
      ? `${code} este codul tău de verificare inSIXlive`
      : `${code} is your inSIXlive verification code`;

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject,
    html: buildVerificationEmailHtml(code, lang, baseUrl),
  });

  if (error) {
    console.error("Resend error (code):", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
  console.log("Code email sent, id:", data?.id);
}

const RESET_COPY = {
  en: {
    subject: "Reset your insixlive password",
    heading: "Reset your password",
    body: "We received a request to reset the password for your insixlive account. Click the button below to choose a new password. This link expires in 1 hour.",
    cta: "Choose a new password",
    ignore: "If you didn't request this, you can safely ignore this email. Your password won't change.",
  },
  ro: {
    subject: "Resetează parola insixlive",
    heading: "Resetează parola",
    body: "Am primit o solicitare de resetare a parolei pentru contul tău insixlive. Apasă butonul de mai jos pentru a alege o parolă nouă. Linkul expiră în 1 oră.",
    cta: "Alege o parolă nouă",
    ignore: "Dacă nu ai solicitat resetarea, poți ignora acest email. Parola ta nu se va schimba.",
  },
} as const;

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  lang: "en" | "ro" = "ro"
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://insixlive.com";
  const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[Password reset] Link for ${email}: ${resetLink}\n`);
  }

  const c = RESET_COPY[lang];
  const resend = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: c.subject,
    html: `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:'DM Sans',-apple-system,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <p style="font-size:18px;font-weight:700;margin:0 0 24px;">insixlive</p>
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #eee;box-shadow:0 2px 12px rgba(0,0,0,.06);">
      <h1 style="font-size:24px;font-weight:700;margin:0 0 12px;letter-spacing:-.02em;">${c.heading}</h1>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px;">${c.body}</p>
      <a href="${resetLink}" style="display:inline-block;background:#09090b;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:10px;">${c.cta}</a>
      <p style="color:#888;font-size:13px;line-height:1.55;margin:28px 0 0;">${c.ignore}</p>
    </div>
    <p style="color:#aaa;font-size:12px;margin-top:20px;text-align:center;">© 2026 insixlive</p>
  </div>
</body></html>`,
  });

  if (error) {
    console.error("Resend error (password reset):", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
  console.log("Password reset email sent, id:", data?.id);
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;
  if (process.env.NODE_ENV !== "production") {
    console.log("\n[Legacy link] Verification link:", verifyLink, "\n");
  }

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
        Your €10.00 edit was approved. We're applying the changes to your website now. This usually takes 1–2 minutes.
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
        We had trouble applying your changes to <strong style="color:#fff;">${siteName}</strong>. Don't worry — your €10.00 has been automatically refunded.
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

const GENERATION_FAILED_PROMO_COPY = {
  en: {
    subject: "Your website generation failed — here's a free retry",
    heading: "Something went wrong on our end",
    body: "We weren't able to generate your website, but your payment went through. Rather than refund and lose your spot, here's a one-time code for a completely free retry — no card needed this time.",
    codeLabel: "Your code",
    cta: "Retry for free",
    note: "Enter this code at checkout. It's valid for 30 days and works once.",
    ignore: "Questions? Reply to this email or contact support@insixlive.com.",
  },
  ro: {
    subject: "Generarea site-ului tău a eșuat — reîncercare gratuită",
    heading: "Ceva n-a mers cum trebuie la noi",
    body: "Nu am reușit să generăm site-ul tău, dar plata ta a trecut. În loc să te rambursăm și să pierzi locul, îți trimitem un cod de o singură folosință pentru o reîncercare complet gratuită — de data asta fără card.",
    codeLabel: "Codul tău",
    cta: "Reîncearcă gratuit",
    note: "Introdu codul la finalizarea comenzii. E valabil 30 de zile și funcționează o singură dată.",
    ignore: "Întrebări? Răspunde la acest email sau scrie la support@insixlive.com.",
  },
} as const;

export async function sendGenerationFailedPromoEmail(
  email: string,
  code: string,
  lang: "en" | "ro" = "ro"
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://insixlive.com";
  const retryUrl = `${baseUrl}/generate`;
  const c = GENERATION_FAILED_PROMO_COPY[lang];

  console.log(`\n[Email] Generation-failed promo code for ${email}: ${code}\n`);

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: c.subject,
    html: `
<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:18px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;">insixlive</p>
    <div style="margin:32px 0;padding:32px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">${c.heading}</h1>
      <p style="color:rgba(255,255,255,0.55);margin:0 0 20px;font-size:14px;line-height:1.6;">${c.body}</p>
      <div style="background:rgba(255,90,0,0.08);border:1px solid rgba(255,90,0,0.2);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;">${c.codeLabel}</p>
        <p style="margin:0;font-size:20px;font-weight:700;font-family:ui-monospace,'SF Mono',monospace;letter-spacing:0.04em;">${code}</p>
      </div>
      <a href="${retryUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff5a00,#ff8a3d);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">${c.cta}</a>
      <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:16px 0 0;">${c.note}</p>
      <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">${c.ignore}</p>
    </div>
  </div>
</body></html>`,
  });
  if (error) {
    console.error("Generation-failed promo email error:", error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
  console.log("Generation-failed promo email sent, id:", data?.id);
}

export async function sendParishCalendarSetupEmail(
  email: string,
  params: {
    siteName: string;
    adminUrl: string;
    adminEmail: string;
    tempPassword: string;
    vercelProjectName: string;
    storageAlreadyConnected?: boolean;
  }
): Promise<void> {
  const { siteName, adminUrl, adminEmail, tempPassword, vercelProjectName, storageAlreadyConnected } = params;
  const storageTabUrl = `https://vercel.com/dashboard/stores?filter=${encodeURIComponent(vercelProjectName)}`;

  console.log(`\n[Email] Parish calendar setup for ${email}: ${siteName}`);

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";

  const storageStep = storageAlreadyConnected
    ? `<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0;font-weight:600;font-size:14px;color:#fff;">Storage is already connected — just log in below.</p>
      </div>`
    : `<div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;">Step 1 — connect storage (about 2 minutes)</p>
        <ol style="margin:0;padding-left:18px;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;">
          <li>Open your project's Storage tab: <a href="${storageTabUrl}" style="color:#a855f7;">${storageTabUrl}</a></li>
          <li>Click "Create Database" → choose "Blob" → name it anything.</li>
          <li>Connect it to the <b>${vercelProjectName}</b> project.</li>
        </ol>
      </div>`;
  const loginStepLabel = storageAlreadyConnected ? "Log in" : "Step 2 — log in once storage is connected";
  const footerNote = storageAlreadyConnected
    ? "You'll be asked to set a new password the first time you log in."
    : "You'll be asked to set a new password the first time you log in. If you log in before Step 1 is done, it just won't work yet — finish the storage step and try again.";

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
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Your editable weekly schedule is ${storageAlreadyConnected ? "ready" : "almost ready"}</h1>
      <p style="color:rgba(255,255,255,0.55);margin:0 0 20px;font-size:14px;line-height:1.6;">
        ${siteName} now includes a "This Week" schedule page you can update yourself — no code, no redeploys.${storageAlreadyConnected ? "" : " One quick one-time setup step is needed first."}
      </p>
      ${storageStep}
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;">${loginStepLabel}</p>
        <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.55);">Admin URL: <a href="${adminUrl}" style="color:#a855f7;">${adminUrl}</a></p>
        <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.55);">Email: <b style="color:#fff;">${adminEmail}</b></p>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.55);">Temporary password: <b style="color:#fff;">${tempPassword}</b></p>
      </div>
      <p style="margin:0 0 20px;font-size:12px;color:rgba(255,255,255,0.4);">${footerNote}</p>
      <a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Open admin login</a>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error("Parish calendar setup email error:", error.message);
}

const WEBSITE_CREATED_COPY = {
  en: {
    title: "inSIXlive - Your Website Is Live",
    heading: "Your website is live!",
    subtitle:
      "Congratulations — thank you for building with inSIXlive. Your new website is published and ready to share with the world.",
    urlLabel: "Your website address",
    cta: "View Your Website",
    nextSteps: "What's next",
    step1Title: "Share your link",
    step1Body: "Send your website address to friends, customers, and on social media.",
    step2Title: "Connect a custom domain",
    step2Body: "Make it truly yours with a personalized domain name.",
    step3Title: "Keep editing anytime",
    step3Body: "Log back in whenever you want to update your content or design.",
    support: "Questions? Reach our team at",
  },
  ro: {
    title: "inSIXlive - Site-ul tău este live",
    heading: "Site-ul tău este live!",
    subtitle:
      "Felicitări — îți mulțumim că ai creat cu inSIXlive. Noul tău site este publicat și gata să fie împărtășit cu lumea.",
    urlLabel: "Adresa site-ului tău",
    cta: "Vezi site-ul tău",
    nextSteps: "Ce urmează",
    step1Title: "Distribuie linkul",
    step1Body: "Trimite adresa site-ului prietenilor, clienților și pe rețelele sociale.",
    step2Title: "Conectează un domeniu personalizat",
    step2Body: "Fă-l cu adevărat al tău cu un nume de domeniu personalizat.",
    step3Title: "Editează oricând",
    step3Body: "Autentifică-te din nou oricând vrei să-ți actualizezi conținutul sau designul.",
    support: "Întrebări? Contactează echipa noastră la",
  },
} as const;

const WEBSITE_CREATED_CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f8f8; color: #1a1a1a; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; }
    .email-wrapper { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .brand-bar { height: 4px; background: #ff5a00; }
    .header { padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #f0f0f0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .logo { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin-bottom: 16px; }
    .logo span { font-size: 40px; font-weight: 200; color: #09090b; line-height: 1; letter-spacing: -0.02em; }
    .brand-name { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin: 0; color: #09090b; }
    .content { padding: 40px 32px; }
    .live-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,90,0,0.08); border: 1px solid rgba(255,90,0,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 24px; }
    .main-heading { font-size: 28px; font-weight: 700; line-height: 1.2; margin-bottom: 8px; letter-spacing: -0.5px; text-align: center; }
    .subtitle { font-size: 16px; line-height: 1.5; margin-bottom: 32px; font-weight: 400; color: #666666; text-align: center; }
    .url-section { margin-bottom: 28px; }
    .url-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; opacity: 0.7; text-align: center; }
    .url-display { background: #f5f5f5; border: 2px solid #e8e8e8; border-radius: 12px; padding: 18px 20px; text-align: center; }
    .url-display a { font-size: 18px; font-weight: 600; color: #ff5a00; text-decoration: none; word-break: break-all; }
    .cta-button { display: block; width: 100%; padding: 14px 24px; background: #ff5a00; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; border: none; margin-bottom: 36px; }
    .next-steps-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; margin-bottom: 16px; }
    .next-step { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .next-step:last-of-type { border-bottom: none; }
    .next-step-num { flex: 0 0 28px; width: 28px; height: 28px; border-radius: 50%; color: #ffffff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; background: #ff5a00; }
    .next-step-text strong { display: block; font-size: 15px; font-weight: 600; margin-bottom: 2px; color: #1a1a1a; }
    .next-step-text span { font-size: 14px; line-height: 1.5; color: #666666; }
    .support-text { color: #999999; font-size: 13px; line-height: 1.6; margin-top: 28px; text-align: center; }
    .support-text a { color: #ff5a00; text-decoration: none; }
    .footer-section { padding: 24px 32px; border-top: 1px solid #f0f0f0; text-align: center; background: #fafafa; }
    .footer-text { color: #999999; font-size: 12px; line-height: 1.5; margin-bottom: 12px; }
    .footer-links { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
    .footer-link { color: #ff5a00; text-decoration: none; font-size: 12px; }
    .divider { color: #ddd; }`;

const WEBSITE_CREATED_DARK_CSS = `
    @media (prefers-color-scheme: dark) {
      body { background: #0a0a0a !important; color: #ffffff !important; }
      .email-wrapper { background: #1a1a1a !important; border-color: #2a2a2a !important; }
      .header { border-bottom-color: #2a2a2a !important; }
      .header-text { color: #ffffff !important; }
      .subtitle-text { color: #b0b0b0 !important; }
      .body-text { color: #e0e0e0 !important; }
      .url-display { background: #2a2a2a !important; border-color: #3a3a3a !important; }
      .url-display a { color: #ff5a00 !important; }
      .cta-button { background: #ff5a00 !important; color: #ffffff !important; }
      .next-step { border-color: #2a2a2a !important; }
      .next-step-text strong { color: #ffffff !important; }
      .next-step-text span { color: #b0b0b0 !important; }
      .footer-section { border-top-color: #2a2a2a !important; background: #0f0f0f !important; }
      .footer-text { color: #808080 !important; }
      .footer-link { color: #ff5a00 !important; }
      .divider { color: #333333 !important; }
    }`;

function buildWebsiteCreatedEmailHtml(siteUrl: string, lang: "en" | "ro", baseUrl: string): string {
  const c = WEBSITE_CREATED_COPY[lang];
  return `<!DOCTYPE html><html lang="${lang}"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <style>${WEBSITE_CREATED_CSS}${WEBSITE_CREATED_DARK_CSS}</style>
</head>
<body>
  <div class="email-container">
    <div class="email-wrapper">
      <div class="header">
        <div class="logo"><span>6</span></div>
        <h1 class="header-text brand-name">insixlive</h1>
      </div>
      <div class="brand-bar"></div>
      <div class="content">
        <div class="live-icon">🟠</div>
        <h2 class="header-text main-heading">${c.heading}</h2>
        <p class="subtitle-text subtitle">${c.subtitle}</p>
        <div class="url-section">
          <p class="body-text url-label">${c.urlLabel}</p>
          <div class="url-display"><a href="${siteUrl}" target="_blank">${siteUrl}</a></div>
        </div>
        <a class="cta-button" href="${siteUrl}" target="_blank">${c.cta}</a>
        <p class="body-text next-steps-title">${c.nextSteps}</p>
        <div class="next-step">
          <div class="next-step-num">1</div>
          <div class="next-step-text"><strong>${c.step1Title}</strong><span>${c.step1Body}</span></div>
        </div>
        <div class="next-step">
          <div class="next-step-num">2</div>
          <div class="next-step-text"><strong>${c.step2Title}</strong><span>${c.step2Body}</span></div>
        </div>
        <div class="next-step">
          <div class="next-step-num">3</div>
          <div class="next-step-text"><strong>${c.step3Title}</strong><span>${c.step3Body}</span></div>
        </div>
        <p class="support-text">${c.support} <a href="mailto:insixlive@outlook.com">insixlive@outlook.com</a></p>
      </div>
      ${emailFooter(lang, baseUrl)}
    </div>
  </div>
</body></html>`;
}

export async function sendWebsiteCreatedEmail(
  email: string,
  params: { siteName: string; siteUrl: string },
  lang: "en" | "ro" = "ro"
): Promise<void> {
  const { siteName, siteUrl } = params;
  console.log(`\n[Email] Website created for ${email}: ${siteName} -> ${siteUrl}\n`);

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://insixlive.com";

  const subject =
    lang === "ro" ? `Site-ul tău ${siteName} este live!` : `Your website ${siteName} is live!`;

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject,
    html: buildWebsiteCreatedEmailHtml(siteUrl, lang, baseUrl),
  });

  if (error) console.error("Website created email error:", error.message);
  else console.log("Website created email sent, id:", data?.id);
}

// Plain-text internal alert for failures that need a human to look — right
// now just "a refund attempt itself failed," so a customer may be owed money
// with no other trace of it. Best-effort: never throws, so a broken alert
// can't take down the flow it's alerting about.
export async function sendOpsAlert(subject: string, body: string): Promise<void> {
  const to = process.env.OPS_ALERT_EMAIL || "support@insixlive.com";
  console.error(`[ops-alert] ${subject}\n${body}`);
  try {
    const resend = getResend();
    const from = process.env.RESEND_FROM_EMAIL || "inSIXlive <onboarding@resend.dev>";
    await resend.emails.send({
      from,
      to,
      subject: `[insixlive alert] ${subject}`,
      text: body,
    });
  } catch (e) {
    console.error("Ops alert email failed to send:", e);
  }
}
