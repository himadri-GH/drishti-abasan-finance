"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation"; // <-- 1. Import Next.js router
import styles from "./page.module.css";

type PaymentOption = { id: string; unitCode: string; ownerName: string; monthlyRate: number };

export function PaymentForm({ options }: { options: PaymentOption[] }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [incomeType, setIncomeType] = useState<"rent" | "general">("rent");
  
  const router = useRouter(); // <-- 2. Initialize router

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); 
    setSaving(true); 
    setMessage("");
    
    const formData = new FormData(event.currentTarget);

    if (incomeType === "rent") {
      const selectedContractId = formData.get("contractId");
      const selectedOption = options.find(opt => opt.id === selectedContractId);
      if (selectedOption) {
        formData.set("payerName", selectedOption.ownerName);
      }
    } else {
      formData.set("contractId", "");
    }

    const response = await fetch("/api/payments", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(Object.fromEntries(formData)) 
    });
    
    const result = await response.json(); 
    setSaving(false);
    
    if (!response.ok) { 
      setMessage(result.error ?? "Could not save payment."); 
      return; 
    }
    
    setMessage(`Saved as ${result.receiptNo}`); 
    event.currentTarget.reset(); 
    
    // <-- 3. Update the timeout to close modal and refresh Next.js state
    window.setTimeout(() => {
      setOpen(false);      // Close the modal
      setMessage("");      // Clear message for next time
      router.refresh();    // Tell Next.js to fetch fresh data from Turso
    }, 1200);              // Give admin 1.2s to read the success message
  }

  return (
    <>
      <button className={styles.primaryButton} onClick={() => setOpen(true)}>＋ Record payment</button>
      
      {open && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <form className={styles.modal} onSubmit={submit}>
            <div className={styles.modalHeading}>
              <div>
                <p className={styles.eyebrow}>New receipt</p>
                <h3>Record a payment</h3>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>

            {/* Radio Toggle */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
              <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px", fontWeight: "normal" }}>
                <input
                  type="radio"
                  checked={incomeType === "rent"}
                  onChange={() => setIncomeType("rent")}
                />
                Monthly rental
              </label>
              <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px", fontWeight: "normal" }}>
                <input
                  type="radio"
                  checked={incomeType === "general"}
                  onChange={() => setIncomeType("general")}
                />
                General income
              </label>
            </div>

            {/* Conditional Fields */}
            {incomeType === "rent" ? (
              <label>
                Unit and owner
                <select name="contractId" required>
                  <option value="">Select active contract...</option>
                  {options.map((option) => (
                    <option value={option.id} key={option.id}>
                      {option.unitCode} · {option.ownerName} · ₹{option.monthlyRate.toLocaleString("en-IN")}/month
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                Payer name
                <input name="payerName" placeholder="Resident, vendor, or payer name" required />
              </label>
            )}

            <div className={styles.formRow}>
              <label>
                Amount
                <input name="amountReceived" type="number" min="1" step="0.01" placeholder="1500" required />
              </label>
              <label>
                Payment mode
                <select name="paymentMode" defaultValue="UPI">
                  <option>UPI</option>
                  <option>NEFT</option>
                  <option>CASH</option>
                  <option>CHEQUE</option>
                </select>
              </label>
            </div>
            
            <label>
              Month covered
              <input name="billingMonth" type="month" defaultValue="2026-08" required />
            </label>
            
            <label>
              Reference or note
              <input name="notes" placeholder="Optional" />
            </label>
            
            {message && <p className={styles.formMessage}>{message}</p>}
            
            <button className={styles.primaryButton} disabled={saving}>
              {saving ? "Saving..." : "Save payment"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}