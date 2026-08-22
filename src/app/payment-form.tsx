"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type PaymentOption = { id: string; unitCode: string; ownerName: string; monthlyRate: number };

export function PaymentForm({ options }: { options: PaymentOption[] }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(result.error ?? "Could not save payment."); return; }
    setMessage(`Saved as ${result.receiptNo}`); event.currentTarget.reset(); window.setTimeout(() => window.location.reload(), 700);
  }

  return <>
    <button className={styles.primaryButton} onClick={() => setOpen(true)}>＋ Record payment</button>
    {open && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <form className={styles.modal} onSubmit={submit}>
        <div className={styles.modalHeading}><div><p className={styles.eyebrow}>New receipt</p><h3>Record a payment</h3></div><button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close">×</button></div>
        <label>Payer name<input name="payerName" placeholder="Resident or payer name" required /></label>
        <label>Unit and owner<select name="contractId" defaultValue=""><option value="">General income / no unit</option>{options.map((option) => <option value={option.id} key={option.id}>{option.unitCode} · {option.ownerName} · ₹{option.monthlyRate.toLocaleString("en-IN")}/month</option>)}</select></label>
        <div className={styles.formRow}><label>Amount<input name="amountReceived" type="number" min="1" step="0.01" placeholder="1500" required /></label><label>Payment mode<select name="paymentMode" defaultValue="UPI"><option>UPI</option><option>NEFT</option><option>CASH</option><option>CHEQUE</option></select></label></div>
        <label>Month covered<input name="billingMonth" type="month" defaultValue="2026-08" required /></label>
        <label>Reference or note<input name="notes" placeholder="Optional" /></label>
        {message && <p className={styles.formMessage}>{message}</p>}
        <button className={styles.primaryButton} disabled={saving}>{saving ? "Saving..." : "Save payment"}</button>
      </form>
    </div>}
  </>;
}