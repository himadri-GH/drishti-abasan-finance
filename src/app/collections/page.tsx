import Link from "next/link";
import { getCollectionDirectory, getPaymentOptions } from "@/db/dashboard";
import styles from "../page.module.css";
import { ChargeGenerator } from "../charge-generator";
import { ChargeManager } from "../charge-manager";
import { PaymentForm } from "../payment-form";
import { db } from "@/db";
import { paymentLedger } from "@/db/schema";
import { desc, isNull, or, eq } from "drizzle-orm";
import { VoidButton } from "../void-button";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const charges = await getCollectionDirectory("2026-08");
  const paymentOptions = await getPaymentOptions();

  const generalReceipts = db
    ? await db
        .select({
          id: paymentLedger.id,
          receiptNo: paymentLedger.receiptNo,
          payerName: paymentLedger.payerName,
          amountReceived: paymentLedger.amountReceived,
          paymentMode: paymentLedger.paymentMode,
          paymentDate: paymentLedger.paymentDate,
          notes: paymentLedger.notes,
        })
        .from(paymentLedger)
        .where(or(isNull(paymentLedger.contractId), eq(paymentLedger.contractId, "")))
        .orderBy(desc(paymentLedger.paymentDate))
    : [];

  const openCharges = charges.filter((charge) => !charge.isPaid && charge.amountPaid === 0).length;
  const partialCharges = charges.filter((charge) => !charge.isPaid && charge.amountPaid > 0).length;

  return (
    <main className={styles.subPage}>
      <Link className={styles.backLink} href="/">
        ← Back to overview
      </Link>

      <div className={styles.subPageHeader}>
        <div>
          <p className={styles.eyebrow}>August 2026</p>
          <h1>Collections</h1>
          <p className={styles.pageIntro}>
            Monthly charges, due dates, and payment status for every active contract.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className={styles.successBadge}>
            {charges.filter((charge) => charge.isPaid).length} paid · {partialCharges} partial · {openCharges} open
          </span>
          <PaymentForm options={paymentOptions} />
        </div>
      </div>

      <section className={styles.chargePanel}>
        <div>
          <p className={styles.eyebrow}>Billing run</p>
          <h3>Generate monthly charges</h3>
          <p>
            Create this month&apos;s demand for every active unit. Existing charges are skipped safely.
          </p>
        </div>
        <ChargeGenerator />
      </section>

 {/* Monthly Maintenance Demand Table */}
      <section className={styles.tablePanel}>
        <div style={{ padding: "16px 21px 0" }}>
          <p className={styles.eyebrow} style={{ margin: 0 }}>Active Units</p>
          <h3 style={{ margin: "4px 0 12px", fontSize: "16px" }}>Monthly Maintenance Demand</h3>
        </div>

        <div className={styles.collectionTableHeader}>
          <strong>Flat Name</strong>
          <strong>Owner Name</strong>
          <strong>Demand</strong>
          <strong>Paid</strong>
          <strong>Month</strong>
          <strong>Status</strong>
          <strong />
        </div>

        {charges.length ? (
          charges.map((charge) => {
            const flatName = charge.block ? `${charge.block} - ${charge.unitCode}` : charge.unitCode;
            const monthLabel = charge.billingMonth
              ? new Date(`${charge.billingMonth}-01T00:00:00Z`).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })
              : "Aug 2026";

            return (
              <div className={styles.collectionTableRow} key={charge.id}>
                <strong>{flatName}</strong>
                <span>{charge.ownerName}</span>
                <span>₹{Number(charge.amount).toLocaleString("en-IN")}</span>
                <span style={{ color: charge.amountPaid > 0 ? "#1b7340" : "inherit" }}>
                  ₹{Number(charge.amountPaid).toLocaleString("en-IN")}
                </span>
                <span>{monthLabel}</span>
                <span
                  className={
                    charge.isPaid
                      ? styles.statusPill
                      : charge.amountPaid > 0
                      ? styles.partialPill
                      : styles.openPill
                  }
                >
                  {charge.isPaid ? "PAID" : charge.amountPaid > 0 ? "PARTIAL" : "OPEN"}
                </span>
                <ChargeManager id={charge.id} amount={charge.amount} dueDate={charge.dueDate} />
              </div>
            );
          })
        ) : (
          <div className={styles.emptyPage}>
            No monthly charges have been generated yet. Use the billing run above when you are ready.
          </div>
        )}
      </section>

      {/* General Income Table */}
      <section className={styles.tablePanel} style={{ marginTop: "24px" }}>
        <div style={{ padding: "16px 21px 0" }}>
          <p className={styles.eyebrow} style={{ margin: 0 }}>Direct Receipts</p>
          <h3 style={{ margin: "4px 0 12px", fontSize: "16px" }}>General Income & Miscellaneous</h3>
        </div>

        <div className={styles.generalTableHeader}>
          <strong>Receipt #</strong>
          <strong>Payer</strong>
          <strong>Amount</strong>
          <strong>Mode</strong>
          <strong>Date</strong>
          <strong>Notes</strong>
          <strong />
        </div>

        {generalReceipts.length ? (
          generalReceipts.map((receipt) => (
            <div className={styles.generalTableRow} key={receipt.id}>
              <strong>{receipt.receiptNo}</strong>
              <span>{receipt.payerName}</span>
              <span>₹{Number(receipt.amountReceived).toLocaleString("en-IN")}</span>
              <span>{receipt.paymentMode}</span>
              <span>
                {receipt.paymentDate
                  ? new Date(receipt.paymentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              <span>{receipt.notes || "General Income"}</span>
              <VoidButton kind="payment" id={receipt.id} />
            </div>
          ))
        ) : (
          <div className={styles.emptyPage}>
            No general income receipts recorded yet. Use the record payment button above to log one.
          </div>
        )}
      </section>
    </main>
  );
}