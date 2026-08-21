import Link from "next/link";
import { getCollectionDirectory } from "@/db/dashboard";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export default async function CollectionsPage() {
  const charges = await getCollectionDirectory("2026-08");
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>August 2026</p><h1>Collections</h1><p className={styles.pageIntro}>Monthly charges, due dates, and payment status for every active contract.</p></div><span className={styles.successBadge}>{charges.filter((charge) => charge.isPaid).length} paid · {charges.filter((charge) => !charge.isPaid).length} open</span></div><section className={styles.tablePanel}><div className={styles.tableHeader}><strong>Unit</strong><strong>Owner</strong><strong>Charge</strong><strong>Due date</strong><strong>Status</strong></div>{charges.length ? charges.map((charge) => <div className={styles.tableRow} key={charge.unitCode}><strong>{charge.unitCode}</strong><span>{charge.ownerName}</span><span>₹{charge.amount.toLocaleString("en-IN")}</span><span>{charge.dueDate}</span><span className={charge.isPaid ? styles.statusPill : styles.openPill}>{charge.isPaid ? "PAID" : "OPEN"}</span></div>) : <div className={styles.emptyPage}>No monthly charges have been generated yet. Add units first, then generate the monthly billing run.</div>}</section></main>;
}