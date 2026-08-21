import Link from "next/link";
import { getSocietySettings } from "@/db/dashboard";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  const society = await getSocietySettings();
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>Workspace configuration</p><h1>Society settings</h1><p className={styles.pageIntro}>The identity and billing defaults used on receipts and reports.</p></div><span className={styles.successBadge}>Connected · Turso</span></div><section className={styles.settingsPanel}><div><small>Society name</small><strong>{society?.name ?? "Drishti Abasan"}</strong></div><div><small>Registration number</small><strong>{society?.registrationNo ?? "Not added yet"}</strong></div><div><small>Address</small><strong>{society?.address ?? "Not added yet"}</strong></div><div><small>Currency</small><strong>{society?.currency ?? "INR"} · ₹</strong></div></section></main>;
}