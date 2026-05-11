import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import {
  getSiteEditById,
  getSiteById,
  updateSiteEditStatus,
  incrementSiteVersion,
  getUserById,
} from "@/lib/db";
import { deployToVercel } from "@/lib/vercel";
import { generateWebsiteCode } from "@/lib/anthropic";
import {
  sendEditStartedEmail,
  sendEditCompletedEmail,
  sendEditFailedEmail,
} from "@/lib/email";

export const maxDuration = 300;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_xxxxx") throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

async function issueRefund(stripe: Stripe, sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_intent) {
      await stripe.refunds.create({ payment_intent: session.payment_intent as string });
      console.log("Refund issued for session:", sessionId);
    }
  } catch (e) {
    console.error("Refund failed:", e);
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  let editId: string | undefined;

  try {
    const authSession = await getSession();
    if (!authSession) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { sessionId, editId: eid, free } = await request.json();
    editId = eid;

    if (!editId) {
      return NextResponse.json({ error: "editId is required." }, { status: 400 });
    }

    const edit = await getSiteEditById(editId);
    if (!edit || edit.user_id !== authSession.userId) {
      return NextResponse.json({ error: "Edit not found." }, { status: 404 });
    }

    if (edit.status === "completed") {
      return NextResponse.json({ success: true, alreadyDone: true });
    }

    let paymentIntentId: string | null = null;

    if (free || edit.stripe_session_id === "free") {
      paymentIntentId = null;
    } else {
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId required for paid edits." }, { status: 400 });
      }
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
      if (
        checkoutSession.payment_status !== "paid" ||
        checkoutSession.metadata?.editId !== editId ||
        checkoutSession.metadata?.userId !== authSession.userId
      ) {
        return NextResponse.json({ error: "Payment not verified." }, { status: 400 });
      }
      paymentIntentId =
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : null;
    }

    await updateSiteEditStatus(editId, "processing", {
      stripeSessionId: sessionId ?? undefined,
      stripePaymentIntentId: paymentIntentId ?? undefined,
    });

    const site = await getSiteById(edit.site_id, authSession.userId);
    if (!site?.vercel_project_id) {
      await updateSiteEditStatus(editId, "failed");
      if (!free && sessionId) await issueRefund(stripe, sessionId);
      return NextResponse.json({ error: "Site Vercel project not found." }, { status: 500 });
    }

    const user = await getUserById(authSession.userId);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    sendEditStartedEmail(user.email, site.name, edit.description).catch(console.error);

    // Build edit prompt from design preferences + requested changes
    // (No GitHub needed — regenerate from original specs + edit description)
    const designInfo = site.design_preferences
      ? `\nOriginal design preferences:\n${JSON.stringify(site.design_preferences, null, 2)}`
      : "";

    const editPrompt = `You are updating an existing Next.js website for a ${site.business_type || "business"} called "${site.name}".

The website was previously generated with these design preferences:${designInfo}

The user wants the following changes:
${edit.description}

INSTRUCTIONS:
1. Regenerate the complete website incorporating the requested changes.
2. Keep the overall design, layout, colors, and style from the original unless the user specifically asked to change them.
3. Return ONLY the complete updated React component code — no markdown, no explanations, no code fences.
4. The component must be a default export: export default function Page() { ... }
5. Use only inline styles or a single <style> JSX tag — no external CSS or Tailwind.
6. Make the requested changes obvious and well-executed.
7. Use placeholder images from https://picsum.photos/ for any photos.`;

    let newCode: string;
    try {
      newCode = await generateWebsiteCode(editPrompt);
    } catch (e) {
      console.error("Claude generation failed:", e);
      await updateSiteEditStatus(editId, "failed");
      if (!free && sessionId) await issueRefund(stripe, sessionId);
      sendEditFailedEmail(user.email, site.name, edit.description, site.id).catch(console.error);
      return NextResponse.json({ error: "Code generation failed." }, { status: 500 });
    }

    // Deploy to the SAME Vercel project (same URL, all domains update simultaneously)
    let deployedUrl: string;
    try {
      const deployment = await deployToVercel(site.vercel_project_id, newCode, {
        userToken: user.vercel_access_token ?? undefined,
        teamId: user.vercel_team_id ?? undefined,
      });
      deployedUrl = `https://${deployment.url}`;
    } catch (e) {
      console.error("Vercel deploy failed:", e);
      await updateSiteEditStatus(editId, "failed");
      if (!free && sessionId) await issueRefund(stripe, sessionId);
      sendEditFailedEmail(user.email, site.name, edit.description, site.id).catch(console.error);
      return NextResponse.json({ error: "Deployment failed." }, { status: 500 });
    }

    await updateSiteEditStatus(editId, "completed", {
      previousVercelUrl: site.vercel_url ?? undefined,
      newVercelUrl: deployedUrl,
      completedAt: new Date(),
    });
    await incrementSiteVersion(site.id);

    const newVersion = (site.current_version ?? 1) + 1;
    sendEditCompletedEmail(
      user.email,
      site.name,
      edit.description,
      site.vercel_url ?? deployedUrl,
      site.github_url ?? site.vercel_url ?? deployedUrl,
      newVersion
    ).catch(console.error);

    return NextResponse.json({ success: true, siteUrl: site.vercel_url ?? deployedUrl });
  } catch (error) {
    console.error("Process edit error:", error);
    if (editId) await updateSiteEditStatus(editId, "failed").catch(() => {});
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your edit." },
      { status: 500 }
    );
  }
}
