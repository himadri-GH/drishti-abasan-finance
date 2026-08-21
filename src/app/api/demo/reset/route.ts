import { inArray, like, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenseLedger, monthlyCharges, owners, ownershipContracts, paymentLedger, propertyUnits, treasurySnapshots } from "@/db/schema";

export async function POST() {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const deleted = await db.transaction(async (tx) => {
    const demoOwners = await tx.select({ id: owners.id }).from(owners).where(like(owners.fullName, "DEMO%"));
    const demoUnits = await tx.select({ id: propertyUnits.id }).from(propertyUnits).where(like(propertyUnits.unitCode, "DEMO%"));
    const ownerIds = demoOwners.map((item) => item.id);
    const unitIds = demoUnits.map((item) => item.id);
    const contracts = ownerIds.length || unitIds.length ? await tx.select({ id: ownershipContracts.id }).from(ownershipContracts).where(or(ownerIds.length ? inArray(ownershipContracts.ownerId, ownerIds) : undefined, unitIds.length ? inArray(ownershipContracts.propertyUnitId, unitIds) : undefined)) : [];
    const contractIds = contracts.map((item) => item.id);
    const demoPayments = await tx.select({ id: paymentLedger.id }).from(paymentLedger).where(or(like(paymentLedger.payerName, "DEMO%"), contractIds.length ? inArray(paymentLedger.contractId, contractIds) : undefined));
    const demoExpenses = await tx.select({ id: expenseLedger.id }).from(expenseLedger).where(or(like(expenseLedger.paidTo, "DEMO%"), like(expenseLedger.description, "DEMO%")));
    const paymentIds = demoPayments.map((item) => item.id);
    const expenseIds = demoExpenses.map((item) => item.id);
    if (paymentIds.length || expenseIds.length) await tx.delete(treasurySnapshots).where(or(paymentIds.length ? inArray(treasurySnapshots.paymentId, paymentIds) : undefined, expenseIds.length ? inArray(treasurySnapshots.expenseId, expenseIds) : undefined));
    if (paymentIds.length) await tx.delete(paymentLedger).where(inArray(paymentLedger.id, paymentIds));
    if (expenseIds.length) await tx.delete(expenseLedger).where(inArray(expenseLedger.id, expenseIds));
    if (contractIds.length) { await tx.delete(monthlyCharges).where(inArray(monthlyCharges.contractId, contractIds)); await tx.delete(ownershipContracts).where(inArray(ownershipContracts.id, contractIds)); }
    if (unitIds.length) await tx.delete(propertyUnits).where(inArray(propertyUnits.id, unitIds));
    if (ownerIds.length) await tx.delete(owners).where(inArray(owners.id, ownerIds));
    return paymentIds.length + expenseIds.length + contractIds.length + unitIds.length + ownerIds.length;
  });
  return NextResponse.json({ deleted });
}