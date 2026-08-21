import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenseLedger, societies, treasurySnapshots } from "@/db/schema";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json();
  const amount = Number(body.amount);
  const paidTo = String(body.paidTo ?? "").trim();
  const category = String(body.category ?? "").trim();
  const paymentMode = String(body.paymentMode ?? "").trim();
  if (!paidTo || !category || !paymentMode || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a vendor, category, payment mode, and positive amount." }, { status: 400 });
  }

  const society = await db.select({ id: societies.id }).from(societies).limit(1);
  if (!society[0]) return NextResponse.json({ error: "Create the society setup before recording expenses." }, { status: 400 });
  const latest = await db.select({ balance: treasurySnapshots.balanceAfter }).from(treasurySnapshots).orderBy(desc(treasurySnapshots.timestamp)).limit(1);
  const balanceBefore = Number(latest[0]?.balance ?? 0);
  const expenseId = crypto.randomUUID();
  const voucherNo = `EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  await db.transaction(async (tx) => {
    await tx.insert(expenseLedger).values({ id: expenseId, societyId: society[0].id, voucherNo, expenseDate: new Date().toISOString(), category, isFixedExpense: Boolean(body.isFixedExpense), amount, paidTo, paymentMode, referenceNo: body.referenceNo ? String(body.referenceNo).trim() : null, description: body.description ? String(body.description).trim() : null });
    await tx.insert(treasurySnapshots).values({ id: crypto.randomUUID(), societyId: society[0].id, timestamp: new Date().toISOString(), transactionType: "EXPENSE", balanceBefore, amountChanged: -amount, balanceAfter: balanceBefore - amount, expenseId });
  });
  return NextResponse.json({ voucherNo }, { status: 201 });
}