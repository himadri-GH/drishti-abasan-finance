import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { expenseLedger, monthlyCharges, paymentLedger, treasurySnapshots } from "./schema";

const emptyDashboard = {
  balance: 0,
  inflow: 0,
  outflow: 0,
  expected: 0,
  collected: 0,
  paidUnits: 0,
  awaiting: 0,
  overdue: 0,
  payments: [] as Array<{ label: string; detail: string; amount: number; tone: "income" | "expense" }>,
};

export async function getDashboardData(billingMonth: string) {
  if (!db) return emptyDashboard;

  const [balanceRow, inflowRow, outflowRow, collectionRow] = await Promise.all([
    db.select({ value: treasurySnapshots.balanceAfter }).from(treasurySnapshots).orderBy(desc(treasurySnapshots.timestamp)).limit(1),
    db.select({ value: sql<number>`coalesce(sum(${paymentLedger.amountReceived}), 0)` }).from(paymentLedger),
    db.select({ value: sql<number>`coalesce(sum(${expenseLedger.amount}), 0)` }).from(expenseLedger),
    db.select({
      expected: sql<number>`coalesce(sum(${monthlyCharges.amountBilled}), 0)`,
      collected: sql<number>`coalesce(sum(case when ${monthlyCharges.isPaid} = 1 then ${monthlyCharges.amountBilled} else 0 end), 0)`,
      paidUnits: sql<number>`coalesce(sum(case when ${monthlyCharges.isPaid} = 1 then 1 else 0 end), 0)`,
      totalUnits: sql<number>`count(*)`,
    }).from(monthlyCharges).where(eq(monthlyCharges.billingMonth, billingMonth)),
  ]);

  const recentPayments = await db.select({
    payerName: paymentLedger.payerName,
    amount: paymentLedger.amountReceived,
    mode: paymentLedger.paymentMode,
    category: paymentLedger.incomeCategory,
  }).from(paymentLedger).orderBy(desc(paymentLedger.paymentDate)).limit(4);

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
      label: `${payment.category.replaceAll("_", " ")} · ${payment.payerName}`,
      detail: payment.mode,
      amount: Number(payment.amount),
      tone: "income" as const,
    })),
  };
}