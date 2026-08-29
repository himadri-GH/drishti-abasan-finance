"use client";

import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./page.module.css";

type Unit = {
  unitId: string;
  unitCode: string;
  unitType: string;
  block: string | null;
  floorNumber: number | null;
};
export function UnitEditForm({unit,blocks,}: {unit: Unit;blocks: string[];}) 
{
  const [open, setOpen] = useState(false); 
  const [message, setMessage] = useState(""); 
  const [saving, setSaving] = useState(false);
  const [unitType, setUnitType] = useState(unit.unitType);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch(`/api/units/${unit.unitId}`, 
      { method: "PATCH", headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) 
      });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(result.error ?? "Could not update unit."); return; }
    setOpen(false); window.location.reload();
  }
  const modal = open && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}><form className={styles.modal} onSubmit={submit}>
      <div className={styles.modalHeading}><div><p className={styles.eyebrow}>Unit record</p><h3>Edit unit</h3></div><button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close">×</button></div>
      

      <div className={styles.formRow}>
        <label>Unit code <input
                name="unitCode"
                defaultValue={unit.unitCode}
                pattern="[0-9]+"
                title="Enter only the unit number, e.g. 101. Do not include block names like A-101."
                required />
        </label>
        <label>Unit type
          <select
            name="unitType"
            value={unitType}
            onChange={(event) =>
              setUnitType(event.target.value)
            }
          >
              <option>FLAT</option>
              <option>GARAGE</option>
              <option>SHOP</option>
              <option>STORAGE</option>
            </select>
        </label>
      </div>
      <div className={styles.formRow}>
        <label>
          Block
            <select
              name="block"
              defaultValue={unit.block ?? ""}
              required
            >
              {blocks.map((block) => (
                <option
                  key={block}
                  value={block}
                >
                  {block}
                </option>
              ))}
            </select>
        </label>

        {
          unitType === "FLAT" && (
          <label>
            Floor
            <input
              name="floorNumber"
              type="number"
              min="0"
              defaultValue={unit.floorNumber ?? ""}
            />
          </label>)
        }
      </div>
       
      {message && <p className={styles.formMessage}>{message}</p>}<button className={styles.primaryButton} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
    </form></div>;

  return <>
    <button className={styles.editButton} onClick={() => setOpen(true)}>Edit</button>
    {typeof document !== "undefined" && createPortal(modal, document.body)}
  </>;
}