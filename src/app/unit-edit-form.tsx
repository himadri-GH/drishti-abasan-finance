"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type Unit = { contractId: string; unitCode: string; unitType: string; block: string | null; floorNumber: number | null; ownerName: string; phone: string; monthlyRate: number };
export function UnitEditForm({ unit }: { unit: Unit }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch(`/api/units/${unit.contractId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(result.error ?? "Could not update unit."); return; }
    setOpen(false); window.location.reload();
  }
  return <>
    <button className={styles.editButton} onClick={() => setOpen(true)}>Edit</button>
    {open && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}><form className={styles.modal} onSubmit={submit}>
      <div className={styles.modalHeading}><div><p className={styles.eyebrow}>Unit record</p><h3>Edit owner and unit</h3></div><button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close">×</button></div>
      <label>Owner full name<input name="fullName" defaultValue={unit.ownerName} required /></label><label>Phone number<input name="phone" defaultValue={unit.phone} required /></label>
      <div className={styles.formRow}><label>Unit code<input name="unitCode" defaultValue={unit.unitCode} required /></label><label>Unit type<select name="unitType" defaultValue={unit.unitType}><option>FLAT</option><option>GARAGE</option><option>SHOP</option><option>STORAGE</option></select></label></div>
      <div className={styles.formRow}><label>Block<input name="block" defaultValue={unit.block ?? ""} /></label><label>Floor<input name="floorNumber" type="number" min="0" defaultValue={unit.floorNumber ?? ""} /></label></div><label>Monthly rate<input name="monthlyRate" type="number" min="1" step="0.01" defaultValue={unit.monthlyRate} required /></label>
      {message && <p className={styles.formMessage}>{message}</p>}<button className={styles.primaryButton} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
    </form></div>}
  </>;
}