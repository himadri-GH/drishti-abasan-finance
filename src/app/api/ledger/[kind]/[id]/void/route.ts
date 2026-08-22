import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenseLedger, monthlyCharges, paymentAllocations, paymentLedger, treasurySnapshots } from "@/db/schema";

export async function POST(request: Request, context: { params: Promise<{ kind: string; id: string }> }) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const { kind, id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const reason = String(body.reason ?? "").trim();
  if (!reason) return NextResponse.json({ error: "A reason is required." }, { status: 400 });
  if (kind !== "payment" && kind !== "expense") return NextResponse.json({ error: "Unknown ledger type." }, { status: 404 });

  try {
    await db.transaction(async (tx) => {
      const timestamp = new Date().toISOString();
      const latest = await tx.select({ balance: treasurySnapshots.balanceAfter }).from(treasurySnapshots).orderBy(desc(treasurySnapshots.timestamp)).limit(1);
      const balanceBefore = Number(latest[0]?.balance ?? 0);
      if (kind === "payment") {
        const record = await tx.select({ amount: paymentLedger.amountReceived, status: paymentLedger.status }).from(paymentLedger).where(eq(paymentLedger.id, id)).limit(1);
        if (!record[0]) throw new Error("missing");
        if (record[0].status === "VOIDED") throw new Error("already_voided");
        await tx.update(paymentLedger).set({ status: "VOIDED", voidReason: reason, voidedAt: timestamp }).where(eq(paymentLedger.id, id));
        const allocations = await tx.select({ chargeId: paymentAllocations.chargeId }).from(paymentAllocations).where(eq(paymentAllocations.paymentId, id));
        await tx.update(paymentAllocations).set({ status: "VOIDED" }).where(eq(paymentAllocations.paymentId, id));
        for (const allocation of allocations) {
          const active = await tx.select({ total: paymentAllocations.amountApplied }).from(paymentAllocations).where(and(eq(paymentAllocations.chargeId, allocation.chargeId), eq(paymentAllocations.status, "ACTIVE")));
          const charge = await tx.select({ amount: monthlyCharges.amountBilled }).from(monthlyCharges).where(eq(monthlyCharges.id, allocation.chargeId)).limit(1);
          const applied = active.reduce((sum, item) => sum + Number(item.total), 0);
          if (charge[0]) await tx.update(monthlyCharges).set({ isPaid: applied >= Number(charge[0].amount) }).where(eq(monthlyCharges.id, allocation.chargeId));
        }
        const source = await tx.select({ id: treasurySnapshots.id, societyId: treasurySnapshots.societyId }).from(treasurySnapshots).where(eq(treasurySnapshots.paymentId, id)).limit(1);
        if (source[0]) await tx.insert(treasurySnapshots).values({ id: crypto.randomUUID(), societyId: source[0].societyId, timestamp, transactionType: "EXPENSE", balanceBefore, amountChanged: -Number(record[0].amount), balanceAfter: balanceBefore - Number(record[0].amount), reversalOfSnapshotId: source[0].id });
      } else {
        const record = await tx.select({ amount: expenseLedger.amount, societyId: expenseLedger.societyId, status: expenseLedger.status }).from(expenseLedger).where(eq(expenseLedger.id, id)).limit(1);
        if (!record[0]) throw new Error("missing");
        if (record[0].status === "VOIDED") throw new Error("already_voided");
        await tx.update(expenseLedger).set({ status: "VOIDED", voidReason: reason, voidedAt: timestamp }).where(eq(expenseLedger.id, id));
        const source = await tx.select({ id: treasurySnapshots.id }).from(treasurySnapshots).where(eq(treasurySnapshots.expenseId, id)).limit(1);
        if (source[0]) await tx.insert(treasurySnapshots).values({ id: crypto.randomUUID(), societyId: record[0].societyId, timestamp, transactionType: "INCOME", balanceBefore, amountChanged: Number(record[0].amount), balanceAfter: balanceBefore + Number(record[0].amount), reversalOfSnapshotId: source[0].id });
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "already_voided") return NextResponse.json({ error: "This record is already voided." }, { status: 409 });
    if (error instanceof Error && error.message === "missing") return NextResponse.json({ error: "This record was not found." }, { status: 404 });
    return NextResponse.json({ error: "Could not void this record." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
