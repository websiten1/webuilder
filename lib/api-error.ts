import crypto from "crypto";
import { NextResponse } from "next/server";

export function newErrorId(): string {
  return crypto.randomUUID();
}

export function logServerError(
  errorId: string,
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
): void {
  console.error(`[error:${errorId}] ${context}`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...extra,
  });
}

export function genericErrorResponse(errorId: string, status = 500) {
  return NextResponse.json(
    {
      error: "Something went wrong. Please try again.",
      errorId,
    },
    { status }
  );
}
