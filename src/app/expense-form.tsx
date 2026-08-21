"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

export function ExpenseForm() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(result.error ?? "Could not save expense."); return; }
    setMessage(`Saved as ${result.voucherNo}`); event.currentTarget.reset(); window.setTimeout(() => window.location.reload(), 700);
  }
  return <>
    <button className={styles.secondaryButton} onClick={() => setOpen(true)}>＋ Add expense</button>
    {open && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}><form className={styles.modal} onSubmit={submit}>
      <div className={styles.modalHeading}><div><p className={styles.eyebrow}>New voucher</p><h3>Add an expense</h3></div><button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close">×</button></div>
      <label>Paid to<input name="paidTo" placeholder="Vendor or service provider" required /></label>
      <div className={styles.formRow}><label>Amount<input name="amount" type="number" min="1" step="0.01" placeholder="8500" required /></label><label>Category<select name="category" defaultValue="SECURITY"><option>SECURITY</option><option>LIFT_AMC</option><option>ELECTRICITY</option><option>REPAIRS</option><option>DIESEL</option><option>CLEANING</option></select></label></div>
      <div className={styles.formRow}><label>Payment mode<select name="paymentMode" defaultValue="NEFT"><option>UPI</option><option>NEFT</option><option>CASH</option><option>CHEQUE</option></select></label><label>Reference<input name="referenceNo" placeholder="Optional" /></label></div>
      <label>Description<input name="description" placeholder="What was this for?" /></label>
      {message && <p className={styles.formMessage}>{message}</p>}<button className={styles.primaryButton} disabled={saving}>{saving ? "Saving..." : "Save expense"}</button>
    </form></div>}
  </>;
}