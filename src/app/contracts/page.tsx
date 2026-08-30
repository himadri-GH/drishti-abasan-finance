import Link from "next/link";
import { db } from "@/db";
import { getContracts } from "@/db/management";
import { owners, propertyUnits } from "@/db/schema";
import { ContractManager } from "../contract-manager";
import styles from "../page.module.css";
export const dynamic = "force-dynamic";
export default async function ContractsPage() 
{ 
    const contracts = await getContracts(); 
    const [ownerRows, unitRows] = db ? await Promise.all
    ([db.select({ id: owners.id, name: owners.fullName }).from(owners), 
        db.select({ id: propertyUnits.id, code: propertyUnits.unitCode, block: propertyUnits.block, }).from(propertyUnits)]) : [[], []];
        const assignedUnitIds = new Set(
                                            contracts
                                                .filter((contract) => contract.status === "ACTIVE")
                                                .map((contract) => contract.unitId)
                                        );
        const availableUnits = unitRows.filter((row) => !assignedUnitIds.has(row.id));
         return( 
         <main 
            className={styles.subPage}>
                <Link className={styles.backLink} href="/">← Back to overview</Link>
                <div className={styles.subPageHeader}>
                    <div>
                        <p className={styles.eyebrow}>Legal & billing links</p>
                        <h1>Ownership contracts</h1>
                        <p className={styles.pageIntro}>Connect an owner to a property unit and control its recurring financial liability.</p>
                    </div>                        
                        <ContractManager
                        contracts={contracts}
                        owners={ownerRows.map((row) => ({
                            id: row.id,
                            label: row.name,
                        }))}
                        units={availableUnits.map((row) => ({
                                id: row.id,
                                label: `${row.block}-${row.code}`,
                                block: row.block,
                        }))}
                        />
                </div>
                <section className={styles.contractListPage}>
                    {contracts.length ? contracts.map((contract) => 
                    <div className={styles.contractCard} key={contract.id}>
                        <div>
                            <p className={styles.eyebrow}>{contract.status}</p>
                            <h3>{contract.code}</h3>
                            <span>{contract.unitCode} · {contract.ownerName}</span>
                        </div>
                    <strong>₹{contract.rate.toLocaleString("en-IN")}
                        <small>monthly rate</small>
                        </strong>
                    </div>
                    ) : 
                    <div className={styles.emptyPage}>No contracts yet. Add owners and units first, then create the first contract.
                    </div>
                    }
                    </section>
        </main>
         );
}