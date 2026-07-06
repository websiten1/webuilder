import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getSiteEditById,
  getSiteById,
  getSiteEditsBysite,
  updateSiteEditStatus,
  incrementSiteVersion,
  updateSiteVercelUrl,
  getUserById,
} from "@/lib/db";
import {
  deployToVercel,
  deployStaticSiteToVercel,
  getValidVercelToken,
  normalizeDeploymentUrl,
  resolveVercelDeployName,
  VERCEL_RECONNECT_MESSAGE,
} from "@/lib/vercel";
import { generateWebsiteCode } from "@/lib/anthropic";
import { isPresetTemplate, generatePresetPersonalization, buildPresetDeployFiles } from "@/lib/preset-site";
import type { WizardData } from "@/app/components/GenerateWizard";
import { getStripe } from "@/lib/stripe";
import {
  sendEditStartedEmail,
  sendEditCompletedEmail,
  sendEditFailedEmail,
} from "@/lib/email";

export const maxDuration = 300;

async function issueRefund(sessionId: string) {
  try {
    const stripe = getStripe();
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
      if (!free && sessionId) await issueRefund(sessionId);
      return NextResponse.json({ error: "Site Vercel project not found." }, { status: 500 });
    }

    const user = await getUserById(authSession.userId);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const vercelAuth = await getValidVercelToken(authSession.userId);
    if (!vercelAuth) {
      await updateSiteEditStatus(editId, "failed");
      if (!free && sessionId) await issueRefund(sessionId);
      return NextResponse.json(
        { error: VERCEL_RECONNECT_MESSAGE, code: "VERCEL_NOT_CONNECTED" },
        { status: 403 }
      );
    }
    const deployProjectName = resolveVercelDeployName(site);
    console.log(`Edit ${editId}: deployName=${deployProjectName}, projectId=${site.vercel_project_id}`);

    sendEditStartedEmail(user.email, site.name, edit.description).catch(console.error);

    // ── Premium preset site: re-personalize the exact design bundle instead of
    // regenerating code. All completed edit requests are replayed cumulatively
    // so earlier paid edits survive later ones.
    const presetFormData = site.design_preferences as unknown as WizardData | null;
    const presetSlug =
      presetFormData && isPresetTemplate(presetFormData.templateId) ? presetFormData.templateId : null;
    if (presetSlug && presetFormData) {
      try {
        const allEdits = await getSiteEditsBysite(site.id, authSession.userId);
        const priorRequests = allEdits
          .filter(e => e.status === "completed" && e.id !== editId)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map(e => e.description);

        const personalization = await generatePresetPersonalization(presetSlug, presetFormData, [
          ...priorRequests,
          edit.description,
        ]);

        const logoMatch = presetFormData.logo?.uploaded
          ? presetFormData.logo.dataUrl?.match(/^data:([^;]+);base64,(.+)$/)
          : null;
        const logoExt: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
        const files = buildPresetDeployFiles(presetSlug, personalization, {
          logo: logoMatch ? { path: `logo.${logoExt[logoMatch[1]] ?? "png"}`, base64: logoMatch[2] } : undefined,
          socials: presetFormData.socials,
        });

        const deployment = await deployStaticSiteToVercel(deployProjectName, files, {
          userToken: vercelAuth.token,
          teamId: vercelAuth.teamId,
          requireUserToken: true,
        });
        const deployedUrl = normalizeDeploymentUrl(deployment.url);
        // #region agent log
        fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdaeb6'},body:JSON.stringify({sessionId:'fdaeb6',location:'edits/process/route.ts:preset-edit',message:'preset edit redeployed',data:{slug:presetSlug,editId,replacements:personalization.replacements.length,url:deployedUrl},hypothesisId:'preset-flow',timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        await updateSiteEditStatus(editId, "completed", {
          previousVercelUrl: site.vercel_url ?? undefined,
          newVercelUrl: deployedUrl,
          completedAt: new Date(),
        });
        await incrementSiteVersion(site.id);
        if (deployedUrl !== site.vercel_url) {
          await updateSiteVercelUrl(site.id, deployedUrl);
        }

        const newPresetVersion = (site.current_version ?? 1) + 1;
        sendEditCompletedEmail(
          user.email,
          site.name,
          edit.description,
          site.vercel_url ?? deployedUrl,
          site.github_url ?? site.vercel_url ?? deployedUrl,
          newPresetVersion
        ).catch(console.error);

        return NextResponse.json({ success: true, siteUrl: site.vercel_url ?? deployedUrl });
      } catch (e) {
        console.error("Preset edit failed:", e);
        await updateSiteEditStatus(editId, "failed");
        if (!free && sessionId) await issueRefund(sessionId);
        sendEditFailedEmail(user.email, site.name, edit.description, site.id).catch(console.error);
        return NextResponse.json({ error: "Edit processing failed." }, { status: 500 });
      }
    }

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
      if (!free && sessionId) await issueRefund(sessionId);
      sendEditFailedEmail(user.email, site.name, edit.description, site.id).catch(console.error);
      return NextResponse.json({ error: "Code generation failed." }, { status: 500 });
    }

    let deployedUrl: string;
    try {
      const deployment = await deployToVercel(deployProjectName, newCode, {
        userToken: vercelAuth.token,
        teamId: vercelAuth.teamId,
        requireUserToken: true,
      });
      deployedUrl = normalizeDeploymentUrl(deployment.url);
    } catch (e) {
      console.error("Vercel deploy failed:", e);
      await updateSiteEditStatus(editId, "failed");
      if (!free && sessionId) await issueRefund(sessionId);
      sendEditFailedEmail(user.email, site.name, edit.description, site.id).catch(console.error);
      return NextResponse.json({ error: "Deployment failed." }, { status: 500 });
    }

    await updateSiteEditStatus(editId, "completed", {
      previousVercelUrl: site.vercel_url ?? undefined,
      newVercelUrl: deployedUrl,
      completedAt: new Date(),
    });
    await incrementSiteVersion(site.id);
    if (deployedUrl !== site.vercel_url) {
      await updateSiteVercelUrl(site.id, deployedUrl);
    }

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
