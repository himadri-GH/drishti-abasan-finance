import Link from "next/link";
import { getOwners } from "@/db/management";
import { OwnerManager } from "../owner-manager";

import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function OwnersPage() {
  const owners = await getOwners();

  return (
    <main className={styles.subPage}>
 <Link
  className={styles.backLink}
  href="/"
>
  ← Back to overview
</Link>

   <div className={styles.subPageHeader}>
      <div>
        <p className={styles.eyebrow}>
          Owner registry
        </p>

        <h1>Owners</h1>

        <p className={styles.pageIntro}>
          Manage property owners independently from units and contracts.
        </p>
      </div>
      
  </div>
<div
  className={styles.pageActions}
  style={{ alignSelf: "flex-start" }}
>
  <span className={styles.successBadge}>
    {owners.length} records
  </span>
</div>
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  }}
>
  <span className={styles.successBadge}>
    {owners.length} records
  </span>

  <button className={styles.primaryButton}>
    + Add Owner
  </button>
</div>
<section className={styles.tablePanel}>
   <OwnerManager owners={owners} />
</section>
  </main>
);
}