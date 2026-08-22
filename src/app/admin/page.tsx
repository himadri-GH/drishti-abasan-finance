import Link from "next/link";
import { getSocietySettings, getStaffDirectory } from "@/db/dashboard";
import { db } from "@/db";
import { blocks } from "@/db/schema";
import { AdminDataManager } from "../admin-data-manager";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const [society, staff, blockRows] = await Promise.all([getSocietySettings(), getStaffDirectory(), db ? db.select().from(blocks) : Promise.resolve([])]);
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>Administrator workspace</p><h1>Manage data</h1><p className={styles.pageIntro}>Create, edit, and safely deactivate setup records before importing real data.</p></div><span className={styles.successBadge}>Admin tools</span></div><AdminDataManager society={society} blocks={blockRows} staff={staff} /><section className={styles.adminLinks}><Link href="/units">Units, owners & contracts →</Link><Link href="/collections">Monthly charges →</Link><Link href="/expenses">Expense ledger →</Link><Link href="/reports">Reports →</Link></section></main>;
}