import { NextResponse } from "next/server";
import { getSession, deleteSession } from "@/lib/session";
import { deleteUserAccount } from "@/lib/db";
import { genericErrorResponse, logServerError, newErrorId } from "@/lib/api-error";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    await deleteUserAccount(session.userId);
    await deleteSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorId = newErrorId();
    logServerError(errorId, "account/delete", error);
    return genericErrorResponse(errorId);
  }
}
