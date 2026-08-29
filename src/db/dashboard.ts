import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { expenseLedger, monthlyCharges, ownershipContracts, paymentLedger, propertyUnits, owners, societies, treasurySnapshots, vendorStaff } from "./schema";

const emptyDashboard = {
  balance: 0,
  inflow: 0,
  outflow: 0,
  expected: 0,
  collected: 0,
  paidUnits: 0,
  awaiting: 0,
  overdue: 0,
  payments: [] as Array<{ id: string; label: string; detail: string; amount: number; tone: "income" | "expense" }>,
};

export async function getDashboardData(billingMonth: string) {
  if (!db) return emptyDashboard;

  const [balanceRow, inflowRow, outflowRow, collectionRow] = await Promise.all([
    db.select({ value: treasurySnapshots.balanceAfter }).from(treasurySnapshots).orderBy(desc(treasurySnapshots.timestamp)).limit(1),
    db.select({ value: sql<number>`coalesce(sum(${paymentLedger.amountReceived}), 0)` }).from(paymentLedger).where(eq(paymentLedger.status, "ACTIVE")),
    db.select({ value: sql<number>`coalesce(sum(${expenseLedger.amount}), 0)` }).from(expenseLedger).where(eq(expenseLedger.status, "ACTIVE")),
    db.select({
      expected: sql<number>`coalesce(sum(${monthlyCharges.amountBilled}), 0)`,
      collected: sql<number>`coalesce(sum(case when ${monthlyCharges.isPaid} = 1 then ${monthlyCharges.amountBilled} else 0 end), 0)`,
      paidUnits: sql<number>`coalesce(sum(case when ${monthlyCharges.isPaid} = 1 then 1 else 0 end), 0)`,
      totalUnits: sql<number>`count(*)`,
    }).from(monthlyCharges).where(eq(monthlyCharges.billingMonth, billingMonth)),
  ]);

  const recentPayments = await db.select({
    id: paymentLedger.id,
    payerName: paymentLedger.payerName,
    amount: paymentLedger.amountReceived,
    mode: paymentLedger.paymentMode,
    category: paymentLedger.incomeCategory,
  }).from(paymentLedger).where(eq(paymentLedger.status, "ACTIVE")).orderBy(desc(paymentLedger.paymentDate)).limit(4);

  const expected = Number(collectionRow[0]?.expected ?? 0);
  const paidUnits = Number(collectionRow[0]?.paidUnits ?? 0);
  const totalUnits = Number(collectionRow[0]?.totalUnits ?? 0);

  return {
    balance: Number(balanceRow[0]?.value ?? 0),
    inflow: Number(inflowRow[0]?.value ?? 0),
    outflow: Number(outflowRow[0]?.value ?? 0),
    expected,
    collected: Number(collectionRow[0]?.collected ?? 0),
    paidUnits,
    awaiting: Math.max(totalUnits - paidUnits, 0),
    overdue: 0,
    payments: recentPayments.map((payment) => ({
      id: payment.id,
      label: `${payment.category.replaceAll("_", " ")} · ${payment.payerName}`,
      detail: payment.mode,
      amount: Number(payment.amount),
      tone: "income" as const,
    })),
  };
}

export async function getPaymentOptions() {
  if (!db) return [];
  return db.select({
    id: ownershipContracts.id,
    unitCode: propertyUnits.unitCode,
    ownerName: owners.fullName,
    monthlyRate: ownershipContracts.monthlyRate,
  }).from(ownershipContracts)
    .innerJoin(propertyUnits, eq(ownershipContracts.propertyUnitId, propertyUnits.id))
    .innerJoin(owners, eq(ownershipContracts.ownerId, owners.id))
    .where(eq(ownershipContracts.status, "ACTIVE"));
}

export async function getUnitDirectory() {
  if (!db) return [];

  return db
    .select({
      contractId: ownershipContracts.id,
      ownerId: owners.id,
      unitId: propertyUnits.id,
      unitCode: propertyUnits.unitCode,
      unitType: propertyUnits.unitType,
      block: propertyUnits.block,
      floorNumber: propertyUnits.floorNumber,

      ownerName: owners.fullName,
      phone: owners.phone,
      email: owners.email,

      status: ownershipContracts.status,
      monthlyRate: ownershipContracts.monthlyRate,

      balance: sql<number>`
        coalesce(
          ${ownershipContracts.openingBalance}
          + (
            select coalesce(sum(mc.amount_billed), 0)
            from monthly_charges mc
            where mc.contract_id = ${ownershipContracts.id}
          )
          - (
            select coalesce(sum(pa.amount_applied), 0)
            from payment_allocations pa
            where pa.charge_id in (
              select mc2.id
              from monthly_charges mc2
              where mc2.contract_id = ${ownershipContracts.id}
            )
            and pa.status = 'ACTIVE'
          ),
        0
      `,
    })
    .from(propertyUnits)
    .leftJoin(
      ownershipContracts,
      eq(ownershipContracts.propertyUnitId, propertyUnits.id)
    )
    .leftJoin(
      owners,
      eq(ownershipContracts.ownerId, owners.id)
    )
    .orderBy(propertyUnits.unitCode);
}

export async function getExpenseDirectory() {
  if (!db) return [];
  return db.select({ id: expenseLedger.id, voucherNo: expenseLedger.voucherNo, paidTo: expenseLedger.paidTo, category: expenseLedger.category, amount: expenseLedger.amount, paymentMode: expenseLedger.paymentMode, expenseDate: expenseLedger.expenseDate, status: expenseLedger.status }).from(expenseLedger).orderBy(desc(expenseLedger.expenseDate)).limit(50);
}

export async function getReportSummary() {
  if (!db) return { income: 0, expenses: 0, payments: 0, vouchers: 0 };
  const [income, expenses, payments, vouchers] = await Promise.all([
    db.select({ value: sql<number>`coalesce(sum(${paymentLedger.amountReceived}), 0)` }).from(paymentLedger).where(eq(paymentLedger.status, "ACTIVE")),
    db.select({ value: sql<number>`coalesce(sum(${expenseLedger.amount}), 0)` }).from(expenseLedger).where(eq(expenseLedger.status, "ACTIVE")),
    db.select({ value: sql<number>`count(*)` }).from(paymentLedger).where(eq(paymentLedger.status, "ACTIVE")),
    db.select({ value: sql<number>`count(*)` }).from(expenseLedger).where(eq(expenseLedger.status, "ACTIVE")),
  ]);
  return { income: Number(income[0]?.value ?? 0), expenses: Number(expenses[0]?.value ?? 0), payments: Number(payments[0]?.value ?? 0), vouchers: Number(vouchers[0]?.value ?? 0) };
}

export async function getCollectionDirectory(billingMonth: string) {
  if (!db) return [];
  return db.select({ unitCode: propertyUnits.unitCode, ownerName: owners.fullName, amount: monthlyCharges.amountBilled, amountPaid: sql<number>`coalesce((select sum(pa.amount_applied) from payment_allocations pa where pa.charge_id = ${monthlyCharges.id} and pa.status = 'ACTIVE'), 0)`, dueDate: monthlyCharges.dueDate, isPaid: monthlyCharges.isPaid }).from(monthlyCharges)
    .innerJoin(ownershipContracts, eq(monthlyCharges.contractId, ownershipContracts.id)).innerJoin(propertyUnits, eq(ownershipContracts.propertyUnitId, propertyUnits.id)).innerJoin(owners, eq(ownershipContracts.ownerId, owners.id)).where(eq(monthlyCharges.billingMonth, billingMonth)).orderBy(propertyUnits.unitCode);
}

export async function getStaffDirectory() {
  if (!db) return [];
  return db.select({ id: vendorStaff.id, name: vendorStaff.name, role: vendorStaff.role, phone: vendorStaff.phone, salary: vendorStaff.monthlySalary, status: vendorStaff.status }).from(vendorStaff).orderBy(vendorStaff.name);
}

export async function getSocietySettings() {
  if (!db) return null;
  const society = await db.select({ name: societies.name, registrationNo: societies.registrationNo, address: societies.address, currency: societies.currency }).from(societies).limit(1);
  return society[0] ?? null;
}