import { asc, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { monthlyCharges, owners, ownershipContracts, paymentLedger, propertyUnits, expenseLedger } from "./schema";

export async function getContracts() {
  if (!db) return [];
  return db.select({ id: ownershipContracts.id, code: ownershipContracts.contractCode, status: ownershipContracts.status, occupancy: ownershipContracts.occupancyType, startDate: ownershipContracts.startDate, endDate: ownershipContracts.endDate, rate: ownershipContracts.monthlyRate, opening: ownershipContracts.openingBalance, ownerId: owners.id, ownerName: owners.fullName, unitId: propertyUnits.id, unitCode: propertyUnits.unitCode }).from(ownershipContracts).innerJoin(owners, eq(ownershipContracts.ownerId, owners.id)).innerJoin(propertyUnits, eq(ownershipContracts.propertyUnitId, propertyUnits.id)).orderBy(asc(propertyUnits.unitCode));
}
export async function getChargeManagement() {
  if (!db) return [];
  return db.select({ id: monthlyCharges.id, billingMonth: monthlyCharges.billingMonth, amount: monthlyCharges.amountBilled, dueDate: monthlyCharges.dueDate, isPaid: monthlyCharges.isPaid, status: monthlyCharges.status, unitCode: propertyUnits.unitCode, ownerName: owners.fullName }).from(monthlyCharges).innerJoin(ownershipContracts, eq(monthlyCharges.contractId, ownershipContracts.id)).innerJoin(propertyUnits, eq(ownershipContracts.propertyUnitId, propertyUnits.id)).innerJoin(owners, eq(ownershipContracts.ownerId, owners.id)).orderBy(desc(monthlyCharges.billingMonth), asc(propertyUnits.unitCode));
}
export async function getLedgerManagement() {
  if (!db) return { payments: [], expenses: [] };
  const [payments, expenses] = await Promise.all([db.select({ id: paymentLedger.id, receiptNo: paymentLedger.receiptNo, payerName: paymentLedger.payerName, amount: paymentLedger.amountReceived, mode: paymentLedger.paymentMode, notes: paymentLedger.notes, status: paymentLedger.status }).from(paymentLedger).orderBy(desc(paymentLedger.paymentDate)), db.select({ id: expenseLedger.id, voucherNo: expenseLedger.voucherNo, paidTo: expenseLedger.paidTo, amount: expenseLedger.amount, category: expenseLedger.category, mode: expenseLedger.paymentMode, description: expenseLedger.description, status: expenseLedger.status }).from(expenseLedger).orderBy(desc(expenseLedger.expenseDate))]);
  return { payments, expenses };
}