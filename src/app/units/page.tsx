import Link from "next/link";
import { getUnitDirectory } from "@/db/dashboard";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export default async function UnitsPage() {
  const units = await getUnitDirectory();
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>Property register</p><h1>Units & owners</h1><p className={styles.pageIntro}>Every home, parking space, and commercial unit with its active contract.</p></div><span className={styles.successBadge}>{units.length} records</span></div><section className={styles.tablePanel}><div className={styles.tableHeader}><strong>Unit</strong><strong>Owner</strong><strong>Contact</strong><strong>Monthly rate</strong><strong>Status</strong></div>{units.length ? units.map((unit) => <div className={styles.tableRow} key={unit.unitCode}><strong>{unit.unitCode}<small>{unit.block ?? ""} · {unit.unitType}</small></strong><span>{unit.ownerName}</span><span>{unit.phone}</span><span>₹{unit.monthlyRate.toLocaleString("en-IN")}</span><span className={styles.statusPill}>{unit.status}</span></div>) : <div className={styles.emptyPage}>No units yet. Use <Link href="/">Add first unit</Link> from the overview when you are ready.</div>}</section></main>;
}