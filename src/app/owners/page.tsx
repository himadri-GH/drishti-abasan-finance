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
       <div className={styles.pageActions}>
        <span className={styles.successBadge}>
          {owners.length} records
        </span>
      </div> 
      </div>
  </div>

<section className={styles.tablePanel}>
   <OwnerManager owners={owners} />
</section>
  </main>
);
}