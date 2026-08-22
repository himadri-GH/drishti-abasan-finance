import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { monthlyCharges, ownershipContracts, paymentAllocations, paymentLedger, societies, treasurySnapshots } from "@/db/schema";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json();
  const payerName = String(body.payerName ?? "").trim();
  const amountReceived = Number(body.amountReceived);
  const paymentMode = String(body.paymentMode ?? "").trim();
  const contractId = body.contractId ? String(body.contractId) : null;
  if (!payerName || !Number.isFinite(amountReceived) || amountReceived <= 0 || !["UPI", "NEFT", "CASH", "CHEQUE"].includes(paymentMode)) return NextResponse.json({ error: "Enter a payer, a positive amount, and valid payment mode." }, { status: 400 });

  const paymentId = crypto.randomUUID();
  const paymentDate = new Date().toISOString();
  const receiptNo = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  const billingMonth = String(body.billingMonth ?? "").trim();
  const monthCovered = billingMonth ? new Date(`${billingMonth}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) : String(body.monthCovered ?? "August 2026");

  try {
    await db.transaction(async (tx) => {
      const society = await tx.select({ id: societies.id }).from(societies).limit(1);
      if (!society[0]) throw new Error("society_missing");
      const latest = await tx.select({ balance: treasurySnapshots.balanceAfter }).from(treasurySnapshots).orderBy(desc(treasurySnapshots.timestamp)).limit(1);
      const balanceBefore = Number(latest[0]?.balance ?? 0);
      let monthlyRate: number | null = null;
      let balanceBeforePayment: number | null = null;
      let unappliedAmount = amountReceived;
      const pendingAllocations: Array<{ chargeId: string; amountApplied: number; isPaid: boolean }> = [];

      if (contractId) {
        const contract = await tx.select({ monthlyRate: ownershipContracts.monthlyRate, openingBalance: ownershipContracts.openingBalance }).from(ownershipContracts).where(eq(ownershipContracts.id, contractId)).limit(1);
        if (!contract[0]) throw new Error("contract_missing");
        monthlyRate = Number(contract[0].monthlyRate);
        const charges = await tx.select({ id: monthlyCharges.id, amount: monthlyCharges.amountBilled }).from(monthlyCharges).where(eq(monthlyCharges.contractId, contractId)).orderBy(asc(monthlyCharges.billingMonth));
        const allocations = await tx.select({ chargeId: paymentAllocations.chargeId, amount: paymentAllocations.amountApplied }).from(paymentAllocations).where(eq(paymentAllocations.status, "ACTIVE"));
        const allocatedByCharge = new Map<string, number>();
        for (const allocation of allocations) allocatedByCharge.set(allocation.chargeId, (allocatedByCharge.get(allocation.chargeId) ?? 0) + Number(allocation.amount));
        balanceBeforePayment = Number(contract[0].openingBalance) + charges.reduce((sum, charge) => sum + Number(charge.amount) - (allocatedByCharge.get(charge.id) ?? 0), 0);
        for (const charge of charges) {
          const remaining = Math.max(Number(charge.amount) - (allocatedByCharge.get(charge.id) ?? 0), 0);
          const applied = Math.min(remaining, unappliedAmount);
          if (applied > 0) {
            pendingAllocations.push({ chargeId: charge.id, amountApplied: applied, isPaid: applied >= remaining });
            unappliedAmount -= applied;
          }
          if (unappliedAmount <= 0) break;
        }
      }

      await tx.insert(paymentLedger).values({ id: paymentId, receiptNo, paymentDate, amountReceived, incomeCategory: "MAINTENANCE", sourceType: contractId ? "RESIDENT" : "THIRD_PARTY", payerName, contractId, appliedMonthlyRate: monthlyRate, balanceBeforePayment, unappliedAmount, monthCovered, paymentMode, referenceNo: body.referenceNo ? String(body.referenceNo).trim() : null, notes: body.notes ? String(body.notes).trim() : null });
      if (pendingAllocations.length) {
        await tx.insert(paymentAllocations).values(pendingAllocations.map((allocation) => ({ id: crypto.randomUUID(), paymentId, chargeId: allocation.chargeId, amountApplied: allocation.amountApplied })));
        for (const allocation of pendingAllocations) await tx.update(monthlyCharges).set({ isPaid: allocation.isPaid }).where(eq(monthlyCharges.id, allocation.chargeId));
      }
      await tx.insert(treasurySnapshots).values({ id: crypto.randomUUID(), societyId: society[0].id, timestamp: paymentDate, transactionType: "INCOME", balanceBefore, amountChanged: amountReceived, balanceAfter: balanceBefore + amountReceived, paymentId });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "society_missing") return NextResponse.json({ error: "Create the society setup before recording payments." }, { status: 400 });
    if (error instanceof Error && error.message === "contract_missing") return NextResponse.json({ error: "That unit contract was not found." }, { status: 400 });
    return NextResponse.json({ error: "Could not save this payment." }, { status: 500 });
  }
  return NextResponse.json({ receiptNo }, { status: 201 });
}
