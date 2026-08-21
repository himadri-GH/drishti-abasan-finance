import Link from "next/link";
import { getReportSummary } from "@/db/dashboard";
import styles from "../page.module.css";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
export const dynamic = "force-dynamic";
export default async function ReportsPage() {
  const report = await getReportSummary();
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>Committee reporting</p><h1>Financial reports</h1><p className={styles.pageIntro}>A clean monthly snapshot for review, reconciliation, and sharing.</p></div><button className={styles.secondaryButton}>↓ Export report</button></div><section className={styles.reportGrid}><div className={styles.reportCard}><small>Total income</small><strong>{money(report.income)}</strong><span>{report.payments} payments recorded</span></div><div className={styles.reportCard}><small>Total expenses</small><strong>{money(report.expenses)}</strong><span>{report.vouchers} vouchers recorded</span></div><div className={styles.reportCard}><small>Net movement</small><strong>{money(report.income - report.expenses)}</strong><span>Income minus expenses</span></div></section><section className={styles.reportNote}><span>▥</span><div><strong>Monthly balance sheet</strong><p>Once your records are entered, this view becomes the committee-ready summary of collections, expenses, and closing treasury balance.</p></div></section></main>;
}