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
  //console.log("BLOCK ROWS:", blockRows);

  return <main className={styles.subPage}>
    <Link className={styles.backLink} href="/">
    ← Back to overview
    </Link>
    <div className={styles.subPageHeader}><div>
      <p className={styles.eyebrow}>Property register</p>
      <h1>Units</h1>
     <p className={styles.pageIntro}>
       Every flat, garage, shop, and storage unit registered in the property.
     </p></div>
      <div className={styles.pageActions}>
        <span 
        className={styles.successBadge}>{units.length} 
        records
        </span>
        
        <UnitSetupForm
            buttonLabel="＋ Add unit"
            blocks={blockRows.filter((block) => block.status === "ACTIVE").map((block) => block.name)}
          //blocks={["A", "B"]}  
        />
      </div>
    </div>
    <section className={styles.tablePanel}>
      <div className={styles.tableHeader}>
        <strong>Unit</strong>
        <strong>Type</strong>
        <strong>Block</strong>
        <strong>Floor</strong>
        <strong />
      </div>
      {units.length ? units.map((unit) =>
         <div 
            className={styles.tableRow} 
            key={unit.unitCode}>
              <strong>
                {unit.block
                  ? `${unit.block}-${unit.unitCode}`
                  : unit.unitCode
                }

                  <small>{unit.block ?? ""} · {unit.unitType}
                  </small>
              </strong>
              
             
              <span>{unit.unitType}</span>

              <span>{unit.block ?? "-"}</span>

              <span>{unit.floorNumber ?? "-"}</span>

             <UnitEditForm
                unit={unit}
                blocks={blockRows
                  .filter((block) => block.status === "ACTIVE")
                  .map((block) => block.name)}
             />
            </div>) : 
              <div className={styles.emptyPage}>No units yet. Use Add unit above when you are ready.
              </div>}
              </section>
      </main>;
}