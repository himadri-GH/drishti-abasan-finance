 "use client";



import { FormEvent, useState } from "react";
import styles from "./page.module.css";



export function UnitSetupForm({
buttonLabel = "＋ Add first unit",
blocks = [],
}: {
buttonLabel?: string;
blocks?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [unitType, setUnitType] = useState("FLAT");


  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();



    const form = event.currentTarget;



    setSaving(true);
    setMessage("");



    const response = await fetch("/api/setup/unit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        Object.fromEntries(new FormData(form))
      ),
    });



    const result = await response.json();



    setSaving(false);



    if (!response.ok) {
      setMessage(result.error ?? "Could not create unit.");
      return;
    }



   setMessage(
        `${result.unitCode} created successfully`
    );



    form.reset();



    window.setTimeout(() => {
      setOpen(false);
      window.location.reload();
    }, 800);
  }



  return (
    <>
      <button
        className={styles.setupButton}
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </button>



      {open && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            setOpen(false)
          }
        >
          <form
            className={styles.modal}
            onSubmit={submit}
          >
            <div className={styles.modalHeading}>
              <div>
                <p className={styles.eyebrow}>
                  Building setup
                </p>
                <h3>Add unit</h3>
              </div>



              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>


          


            <div className={styles.formRow}>
              <label>
                Unit code
                <input
                  name="unitCode"
                  placeholder="101"
                  pattern="[0-9]+"
                  title="Enter only the unit number, e.g. 101. Do not include block names like A-101."
                  required
                />
                <small>
                  Enter only the unit number. Block is selected separately.
                </small>
              </label>

              <label>
                Unit type
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
                  defaultValue=""
                  required
                >
                  <option value="">
                    Select block
                  </option>

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

              {unitType === "FLAT" && (
                <label>
                  Floor
                  <input
                    name="floorNumber"
                    type="number"
                    min="0"
                    placeholder="1"
                  />
                </label>
              )}

            </div>

           



            {message && (
              <p className={styles.formMessage}>
                {message}
              </p>
            )}



            <button
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Create unit"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}