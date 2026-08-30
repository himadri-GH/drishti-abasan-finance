"use client";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";
type Contract = 
              { 
                id: string; 
                code: string; 
                status: string; 
                occupancy: string; 
                startDate: string; 
                endDate: string | null; 
                rate: number; opening: number; 
                ownerId: string; 
                ownerName: string; 
                unitId: string; 
                unitCode: string ;
              };
type Choice = { id: string; label: string;block?: string | null; };
export function ContractManager
              (
                { contracts, owners, units }: 
                  { contracts: Contract[]; 
                    owners: Choice[]; 
                    units: Choice[] 
                  }
              ) 
{
const [open, setOpen] = useState(false);
const [editing, setEditing] = useState<Contract | null>(null); 
const [selectedBlock, setSelectedBlock] = useState("");
const [selectedUnit, setSelectedUnit] = useState("");

const blocks = 
[
  ...new Set(
    units
      .map((unit) => unit.block)
      .filter(
        (block): block is string =>
          Boolean(block)
      )
  ),
];

const filteredUnits =
  selectedBlock === ""
    ? []
    : units.filter(
        (unit) => unit.block === selectedBlock
      );

const selectedUnitLabel =
  filteredUnits.find(
    (unit) => unit.id === selectedUnit
  )?.label ?? "";

const contractCode =
  selectedUnitLabel
    ? `CTR-${selectedUnitLabel}-${new Date().getFullYear()}`
    : "";

const [message, setMessage] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) 
  { 
    event.preventDefault(); 
    const data = Object.fromEntries(new FormData(event.currentTarget)); 
    const response = await fetch(
                                  "/api/contracts", 
                                  { 
                                    method: editing ? "PATCH" : "POST", 
                                    headers: { "Content-Type": "application/json" }, 
                                    body: JSON.stringify({ ...data, id: editing?.id }) 
                                  }
                                ); 
      if (!response.ok) { setMessage((await response.json()).error ?? "Could not save."); return; } window.location.reload(); 
  }
  async function archive(id: string) 
  { 
    if (!window.confirm("Close this contract? Financial history will be preserved.")) 
      return; 
    await fetch(
                  "/api/contracts", 
                  { 
                    method: "DELETE", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ id }) 
                  }
               ); window.location.reload(); 
  }
 const start = (contract?: Contract) =>
  {
    setEditing(contract ?? null);
    setMessage("");
    setSelectedBlock("");
    setSelectedUnit("");
    setOpen(true);
  };
  return <>
  <button className={styles.primaryButton} 
    onClick={() => start()}>＋ New contract
  </button>
  {
    open && 
    <div className={styles.modalBackdrop}>
      <form className={styles.modal} 
        onSubmit={save}>
          <div className={styles.modalHeading}>
          <div>
            <p className={styles.eyebrow}>
              Ownership contract
            </p>
            <h3>{editing ? "Edit contract" : "Create contract"}</h3>
          </div>
        <button type="button" className={styles.closeButton} 
          onClick={() => setOpen(false)}>
            ×
        </button>
        </div>
        {
            editing ? <><label>Owner and unit<input value={`${editing.ownerName} · ${editing.unitCode}`}
            readOnly /></label></> : <>
            <label>
              Owner<select name="ownerId" required>
              <option value="">Choose owner</option>
              {owners.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
              </select>
            </label>
           <label>
              Block
              <select
                value={selectedBlock}
                onChange={(event) =>
                  setSelectedBlock(event.target.value)
                }
                required
              >
                <option value="">
                  Choose block
                </option>

                {blocks.map((block) => (
                  <option
                    key={block}
                    value={block ?? ""}
                  >
                    {block}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Property unit
              <select
                name="propertyUnitId"
                required
                disabled={!selectedBlock}
                value={selectedUnit}
                onChange=
                {(event) =>
                  setSelectedUnit(event.target.value)
                }
              >
                <option value="">
                  Choose unit
                </option>

                {filteredUnits.map((item) => (
                  <option
                    value={item.id}
                    key={item.id}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
           <label>
              Contract code
              <input
                name="contractCode"
                value={contractCode}
                readOnly
                required
              />
            </label></>
        }<div className={styles.formRow}><label>Start date<input name="startDate" type="date" defaultValue={editing?.startDate ?? "2026-08-01"} required /></label><label>End date<input name="endDate" type="date" defaultValue={editing?.endDate ?? ""} /></label></div><div className={styles.formRow}><label>Monthly rate<input name="monthlyRate" type="number" min="1" defaultValue={editing?.rate ?? ""} required /></label><label>Opening balance<input name="openingBalance" type="number" defaultValue={editing?.opening ?? 0} /></label></div><label>Occupancy<select name="occupancyType" defaultValue={editing?.occupancy ?? "SELF_OCCUPIED"}><option>SELF_OCCUPIED</option><option>TENANT</option><option>VACANT</option></select></label>{editing && <label>Status<select name="status" defaultValue={editing.status}><option>ACTIVE</option><option>FROZEN</option><option>TRANSFERRED</option><option>VACATED</option></select></label>}{message && <p className={styles.formMessage}>{message}</p>
        }
  <button className={styles.primaryButton}>
  {editing ? "Save changes" : "Create contract"}
  </button>
  </form></div>}<div className={styles.contractList}>{contracts.map((contract) => <div className={styles.contractRow} key={contract.id}><span><strong>{contract.code}</strong><small>{contract.unitCode} · {contract.ownerName} · ₹{contract.rate.toLocaleString("en-IN")}/month</small></span><span className={styles.adminRowActions}><button className={styles.editButton} onClick={() => start(contract)}>Edit</button>{contract.status === "ACTIVE" && <button className={styles.voidButton} onClick={() => archive(contract.id)}>Close</button>}</span></div>)}</div></>;
}