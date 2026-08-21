import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ownershipContracts, paymentLedger } from "@/db/schema";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const body = await request.json();
  const payerName = String(body.payerName ?? "").trim();
  const amountReceived = Number(body.amountReceived);
  const paymentMode = String(body.paymentMode ?? "").trim();
  const contractId = body.contractId ? String(body.contractId) : null;
  if (!payerName || !Number.isFinite(amountReceived) || amountReceived <= 0 || !paymentMode) {
    return NextResponse.json({ error: "Enter a payer, a positive amount, and payment mode." }, { status: 400 });
  }

  let monthlyRate: number | null = null;
  if (contractId) {
    const contract = await db.select({ monthlyRate: ownershipContracts.monthlyRate }).from(ownershipContracts).where(eq(ownershipContracts.id, contractId)).limit(1);
    if (!contract[0]) return NextResponse.json({ error: "That unit contract was not found." }, { status: 400 });
    monthlyRate = Number(contract[0].monthlyRate);
  }

  const receiptNo = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  await db.insert(paymentLedger).values({
    id: crypto.randomUUID(), receiptNo, paymentDate: new Date().toISOString(), amountReceived,
    incomeCategory: "MAINTENANCE", sourceType: contractId ? "RESIDENT" : "THIRD_PARTY", payerName,
    contractId, appliedMonthlyRate: monthlyRate,
    monthCovered: String(body.monthCovered ?? "August 2026"), paymentMode,
    referenceNo: body.referenceNo ? String(body.referenceNo).trim() : null,
    notes: body.notes ? String(body.notes).trim() : null,
  });
  return NextResponse.json({ receiptNo }, { status: 201 });
}