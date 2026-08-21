"use client";

import { useState } from "react";
import styles from "./page.module.css";

export function VoidButton({ kind, id }: { kind: "payment" | "expense"; id: string }) {
  const [busy, setBusy] = useState(false);
  async function voidRecord() {
    const reason = window.prompt("Why should this record be voided?");
    if (!reason) return;
    if (!window.confirm("Void this record? It will stay in the audit trail but no longer count in totals.")) return;
    setBusy(true);
    const response = await fetch(`/api/ledger/${kind}/${id}/void`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
    setBusy(false);
    if (!response.ok) { window.alert("Could not void this record."); return; }
    window.location.reload();
  }
  return <button className={styles.voidButton} onClick={voidRecord} disabled={busy}>{busy ? "..." : "Void"}</button>;
}