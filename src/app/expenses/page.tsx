import Link from "next/link";
import { getExpenseDirectory } from "@/db/dashboard";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export default async function ExpensesPage() {
  const expenses = await getExpenseDirectory();
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>Outflow register</p><h1>Expense ledger</h1><p className={styles.pageIntro}>Every voucher, utility payment, and building repair in one audit trail.</p></div><span className={styles.successBadge}>{expenses.length} vouchers</span></div><section className={styles.tablePanel}><div className={styles.tableHeader}><strong>Voucher</strong><strong>Paid to</strong><strong>Category</strong><strong>Amount</strong><strong>Date</strong></div>{expenses.length ? expenses.map((expense) => <div className={styles.tableRow} key={expense.voucherNo}><strong>{expense.voucherNo}<small>{expense.paymentMode}</small></strong><span>{expense.paidTo}</span><span>{expense.category.replaceAll("_", " ")}</span><span className={styles.expense}>−₹{expense.amount.toLocaleString("en-IN")}</span><span>{new Date(expense.expenseDate).toLocaleDateString("en-IN")}</span></div>) : <div className={styles.emptyPage}>No expenses yet. Add a voucher from the overview when you are ready.</div>}</section></main>;
}