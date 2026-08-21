"use client";

import { useState } from "react";
import styles from "./page.module.css";

export function DemoResetButton() {
  const [busy, setBusy] = useState(false);
  async function reset() {
    if (!window.confirm("Delete only records beginning with DEMO? This cannot be undone.")) return;
    setBusy(true); const response = await fetch("/api/demo/reset", { method: "POST" }); setBusy(false);
    if (!response.ok) { window.alert("Demo cleanup failed."); return; }
    window.location.reload();
  }
  return <button className={styles.voidButton} onClick={reset} disabled={busy}>{busy ? "Cleaning..." : "Clear DEMO records"}</button>;
}