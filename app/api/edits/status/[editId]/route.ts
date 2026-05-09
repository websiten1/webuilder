import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteEditById } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ editId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { editId } = await params;
  const edit = await getSiteEditById(editId);

  if (!edit || edit.user_id !== session.userId) {
    return NextResponse.json({ error: "Edit not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: edit.id,
    status: edit.status,
    description: edit.description,
    newVercelUrl: edit.new_vercel_url,
    completedAt: edit.completed_at,
    siteId: edit.site_id,
  });
}
