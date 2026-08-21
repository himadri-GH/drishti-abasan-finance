import Link from "next/link";
import { getStaffDirectory } from "@/db/dashboard";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export default async function StaffPage() {
  const staff = await getStaffDirectory();
  return <main className={styles.subPage}><Link className={styles.backLink} href="/">← Back to overview</Link><div className={styles.subPageHeader}><div><p className={styles.eyebrow}>Operations directory</p><h1>Vendors & staff</h1><p className={styles.pageIntro}>Security, cleaning, lift agencies, and repair partners.</p></div><span className={styles.successBadge}>{staff.length} records</span></div><section className={styles.tablePanel}><div className={styles.tableHeader}><strong>Name</strong><strong>Role</strong><strong>Phone</strong><strong>Monthly salary</strong><strong>Status</strong></div>{staff.length ? staff.map((person) => <div className={styles.tableRow} key={`${person.name}-${person.role}`}><strong>{person.name}</strong><span>{person.role.replaceAll("_", " ")}</span><span>{person.phone ?? "-"}</span><span>{person.salary ? `₹${person.salary.toLocaleString("en-IN")}` : "On call"}</span><span className={styles.statusPill}>{person.status}</span></div>) : <div className={styles.emptyPage}>No vendors or staff yet. This directory is ready for your committee’s operational records.</div>}</section></main>;
}