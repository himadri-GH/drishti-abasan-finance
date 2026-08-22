import Link from "next/link";
import { getCollectionDirectory } from "@/db/dashboard";
import styles from "../page.module.css";
import { ChargeGenerator } from "../charge-generator";
import { getChargeManagement } from "@/db/management";
import { ChargeManager } from "../charge-manager";

export const dynamic = "force-dynamic";
export default async function CollectionsPage() {
  const charges = await getCollectionDirectory("2026-08");
  const managedCharges = await getChargeManagement();
  const openCharges = charges.filter((charge) => !charge.isPaid && charge.amountPaid === 0).length;
  const partialCharges = charges.filter((charge) => !charge.isPaid && charge.amountPaid > 0).length;
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>August 2026</p><h1>Collections</h1><p className={styles.pageIntro}>Monthly charges, due dates, and payment status for every active contract.</p></div><span className={styles.successBadge}>{charges.filter((charge) => charge.isPaid).length} paid · {partialCharges} partial · {openCharges} open</span></div><section className={styles.chargePanel}><div><p className={styles.eyebrow}>Billing run</p><h3>Generate monthly charges</h3><p>Create this month&apos;s demand for every active unit. Existing charges are skipped safely.</p></div><ChargeGenerator /></section><section className={styles.tablePanel}><div className={styles.tableHeader}><strong>Unit</strong><strong>Owner</strong><strong>Charge</strong><strong>Paid</strong><strong>Status</strong><strong /></div>{charges.length ? charges.map((charge) => { const managed = managedCharges.find((item) => item.unitCode === charge.unitCode && item.billingMonth === "2026-08"); return <div className={styles.tableRow} key={charge.unitCode}><strong>{charge.unitCode}</strong><span>{charge.ownerName}</span><span>₹{charge.amount.toLocaleString("en-IN")}</span><span>₹{charge.amountPaid.toLocaleString("en-IN")}</span><span className={charge.isPaid ? styles.statusPill : charge.amountPaid > 0 ? styles.partialPill : styles.openPill}>{charge.isPaid ? "PAID" : charge.amountPaid > 0 ? "PARTIAL" : "OPEN"}</span>{managed && <ChargeManager id={managed.id} amount={managed.amount} dueDate={managed.dueDate} />}</div> }) : <div className={styles.emptyPage}>No monthly charges have been generated yet. Use the billing run above when you are ready.</div>}</section></main>;
}