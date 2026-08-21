import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentLedger } from "@/db/schema";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const body = await request.json();
  const payerName = String(body.payerName ?? "").trim();
  const amountReceived = Number(body.amountReceived);
  const paymentMode = String(body.paymentMode ?? "").trim();
  if (!payerName || !Number.isFinite(amountReceived) || amountReceived <= 0 || !paymentMode) {
    return NextResponse.json({ error: "Enter a payer, a positive amount, and payment mode." }, { status: 400 });
  }

  const receiptNo = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  await db.insert(paymentLedger).values({
    id: crypto.randomUUID(), receiptNo, paymentDate: new Date().toISOString(), amountReceived,
    incomeCategory: "MAINTENANCE", sourceType: "RESIDENT", payerName,
    monthCovered: String(body.monthCovered ?? "August 2026"), paymentMode,
    referenceNo: body.referenceNo ? String(body.referenceNo).trim() : null,
    notes: body.notes ? String(body.notes).trim() : null,
  });
  return NextResponse.json({ receiptNo }, { status: 201 });
}