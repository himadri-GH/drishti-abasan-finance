"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export function ChargeManager({ id, amount, dueDate }: { id: string; amount: number; dueDate: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    await fetch(`/api/charges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  async function voidCharge() {
    const reason = window.prompt("Why should this monthly charge be voided?");
    if (!reason || !window.confirm("Void this monthly charge?")) return;

    await fetch(`/api/charges/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    router.refresh();
  }

  return (
    <span className={styles.adminRowActions}>
      <button type="button" className={styles.editButton} onClick={() => setOpen(true)}>
        Edit
      </button>
      <button type="button" className={styles.voidButton} onClick={voidCharge}>
        Void
      </button>

      {open && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <form className={styles.modal} onSubmit={save}>
            <div className={styles.modalHeading}>
              <div>
                <p className={styles.eyebrow}>Single Month Adjustment</p>
                <h3>Edit monthly demand</h3>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0" }}>
              Modifying this value only affects this specific bill. The recurring base rate remains controlled under Contracts.
            </p>

            <label>
              Amount (₹)
              <input name="amount" type="number" min="1" step="0.01" defaultValue={amount} required />
            </label>

            <label>
              Due date
              <input name="dueDate" type="date" defaultValue={dueDate} required />
            </label>

            <button className={styles.primaryButton} disabled={saving}>
              {saving ? "Saving..." : "Save charge"}
            </button>
          </form>
        </div>
      )}
    </span>
  );
}