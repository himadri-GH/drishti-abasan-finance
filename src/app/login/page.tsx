"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function LoginPage() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); setBusy(false); if (!response.ok) { setError((await response.json()).error); return; } router.push("/"); }
  return <main className={styles.loginPage}><div className={styles.loginCard}><span className={styles.brandMark}>DA</span><p className={styles.eyebrow}>Drishti Abasan Finance</p><h1>Administrator sign in</h1><p>Use the private committee access password to continue.</p><form onSubmit={submit}><label>Access password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <strong className={styles.loginError}>{error}</strong>}<button className={styles.primaryButton} disabled={busy}>{busy ? "Checking..." : "Sign in"}</button></form></div></main>;
}