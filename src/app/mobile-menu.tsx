"use client";

import { useState } from "react";
import styles from "./page.module.css";

const links = [
  ["◈", "Overview", "/#overview"],
  ["◌", "Collections", "/collections"],
  ["↗", "Expenses", "/expenses"],
  ["⌂", "Units", "/units"],
  ["▥", "Reports", "/reports"],
  ["⌘", "Contracts", "/contracts"],
  ["≡", "Full ledger", "/ledger"],
  ["♙", "Staff", "/staff"],
  ["⚙", "Settings", "/settings"],
  ["✎", "Manage data", "/admin"],
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return <>
    <header className={styles.mobileHeader}>
      <div className={styles.mobileBrand}><span className={styles.brandMark}>DA</span><strong>Drishti Abasan</strong></div>
      <button className={styles.menuButton} onClick={() => setOpen(true)} aria-label="Open menu"><span /><span /><span /></button>
    </header>
    {open && <div className={styles.menuBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <nav className={styles.menuDrawer} aria-label="Mobile navigation">
        <div className={styles.menuHeading}><div><p className={styles.eyebrow}>Finance workspace</p><h3>Menu</h3></div><button className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close menu">×</button></div>
        <div className={styles.menuLinks}>{links.map(([icon, label, href]) => <a href={href} key={label} onClick={() => setOpen(false)}><span>{icon}</span>{label}<b>›</b></a>)}</div>
        <div className={styles.menuFooter}><span className={styles.dot} /> Cloud sync active <small>· Turso</small></div>
      </nav>
    </div>}
  </>;
}