import Link from "next/link";
import { getUnitDirectory } from "@/db/dashboard";
import styles from "../page.module.css";
import { UnitEditForm } from "../unit-edit-form";
import { UnitSetupForm } from "../unit-setup-form";
import { db } from "@/db";
import { blocks } from "@/db/schema";

export const dynamic = "force-dynamic";
export default async function UnitsPage() {
  //const units = await getUnitDirectory();
  const [units, blockRows] = await Promise.all([getUnitDirectory(),db ? db.select().from(blocks) : Promise.resolve([]),]);
  return <main className={styles.subPage}>
    <Link className={styles.backLink} href="/">
    ← Back to overview
    </Link>
    <div className={styles.subPageHeader}><div>
      <p className={styles.eyebrow}>Property register</p>
      <h1>Units & owners</h1>
      <p className={styles.pageIntro}>
      Every home, parking space, and commercial unit with its active contract.
      </p></div>
      <div className={styles.pageActions}>
        <span 
        className={styles.successBadge}>{units.length} 
        records
        </span>
        // <UnitSetupForm buttonLabel="＋ Add unit" />
        <UnitSetupForm
            buttonLabel="＋ Add unit"
            blocks={blockRows.filter((block) => block.status === "ACTIVE").map((block) => block.name)}
        />
      </div>
    </div>
    <section className={styles.tablePanel}>
      <div className={styles.tableHeader}>
        <strong>Unit</strong>
        <strong>Owner</strong>
        <strong>Contact</strong>
        <strong>Balance</strong>
        <strong>Status</strong>
        <strong />
      </div>
      {units.length ? units.map((unit) =>
         <div 
            className={styles.tableRow} 
            key={unit.unitCode}>
              <strong>
                {unit.unitCode}
                  <small>{unit.block ?? ""} · {unit.unitType}
                  </small>
              </strong>
              <span>{unit.ownerName}</span>
              <span>{unit.phone}</span>
              <span 
                  className={unit.balance > 0 ? styles.expense : styles.income}>
                    {unit.balance > 0 ? `₹${unit.balance.toLocaleString("en-IN")} due` : `₹${Math.abs(unit.balance).toLocaleString("en-IN")} credit`}
              </span>
              <span className={styles.statusPill}>{unit.status}</span>
              <UnitEditForm unit={unit} /></div>) : 
              <div className={styles.emptyPage}>No units yet. Use Add unit above when you are ready.
              </div>}
              </section>
      </main>;
}