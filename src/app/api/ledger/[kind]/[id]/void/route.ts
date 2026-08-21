import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenseLedger, paymentLedger } from "@/db/schema";

export async function POST(request: Request, context: { params: Promise<{ kind: string; id: string }> }) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const { kind, id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const reason = String(body.reason ?? "Correction requested").trim();
  if (!reason) return NextResponse.json({ error: "A reason is required." }, { status: 400 });

  const values = { status: "VOIDED", voidReason: reason, voidedAt: new Date().toISOString() };
  if (kind === "payment") {
    const result = await db.update(paymentLedger).set(values).where(eq(paymentLedger.id, id));
    return NextResponse.json({ ok: true, kind, result });
  }
  if (kind === "expense") {
    const result = await db.update(expenseLedger).set(values).where(eq(expenseLedger.id, id));
    return NextResponse.json({ ok: true, kind, result });
  }
  return NextResponse.json({ error: "Unknown ledger type." }, { status: 404 });
}