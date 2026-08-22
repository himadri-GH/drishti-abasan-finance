"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

export function ChargeGenerator() {
  const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/charges/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const result = await response.json(); setSaving(false);
    setMessage(response.ok ? `${result.created} monthly charges are ready.` : result.error ?? "Could not generate charges.");
    if (response.ok) window.setTimeout(() => window.location.reload(), 700);
  }
  return <form className={styles.chargeForm} onSubmit={submit}><label>Billing month<input name="billingMonth" type="month" defaultValue="2026-08" required /></label><label>Due date<input name="dueDate" type="date" defaultValue="2026-08-10" required /></label><button className={styles.primaryButton} disabled={saving}>{saving ? "Generating..." : "Generate charges"}</button>{message && <p className={styles.formMessage}>{message}</p>}</form>;
}