import Link from "next/link";
import { getSocietySettings } from "@/db/dashboard";
import styles from "../page.module.css";
import { DemoResetButton } from "../demo-reset-button";

export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  const society = await getSocietySettings();
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>Workspace configuration</p><h1>Society settings</h1><p className={styles.pageIntro}>The identity and billing defaults used on receipts and reports.</p></div><span className={styles.successBadge}>Connected · Turso</span></div><section className={styles.settingsPanel}><div><small>Society name</small><strong>{society?.name ?? "Drishti Abasan"}</strong></div><div><small>Registration number</small><strong>{society?.registrationNo ?? "Not added yet"}</strong></div><div><small>Address</small><strong>{society?.address ?? "Not added yet"}</strong></div><div><small>Currency</small><strong>{society?.currency ?? "INR"} · ₹</strong></div></section><section className={styles.demoPanel}><div><p className={styles.eyebrow}>Testing tools</p><h3>Demo data cleanup</h3><p>Only records whose names begin with <strong>DEMO</strong> will be removed.</p></div><DemoResetButton /></section></main>;
}