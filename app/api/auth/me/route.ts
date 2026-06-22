import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId:`auth-me-${Date.now()}`,hypothesisId:'H9',location:'app/api/auth/me/route.ts:8',message:'auth/me called',data:{hasSession:!!session,sessionUserId:session?.userId??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified,
        paymentStatus: user.payment_status,
        vercelAuthorized: user.vercel_authorized ?? false,
        preferredLanguage: user.preferred_language,
      },
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
