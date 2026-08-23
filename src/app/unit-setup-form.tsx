"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

export function UnitSetupForm({
  buttonLabel = "＋ Add first unit",
}: {
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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
      `${result.unitCode} is ready for ${result.fullName}`
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
                <h3>Add owner and unit</h3>
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

            <label>
              Owner full name
              <input
                name="fullName"
                placeholder="e.g. Riya Sen"
                required
              />
            </label>

            <label>
              Phone number
              <input
                name="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                required
              />
            </label>

            <label>
               Email address
              <input
                name="email"
                type="email"
                placeholder="e.g. owner@example.com"
              />
            </label>

            <div className={styles.formRow}>
              <label>
                Unit code
                <input
                  name="unitCode"
                  placeholder="101"
                  required
                />
              </label>

              <label>
                Unit type
                <select
                  name="unitType"
                  defaultValue="FLAT"
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
                <input
                  name="block"
                  placeholder="A"
                  required
                />
              </label>

              <label>
                Floor
                <input
                  name="floorNumber"
                  type="number"
                  min="0"
                  placeholder="1"
                />
              </label>
            </div>

            <label>
              Monthly maintenance rate
              <input
                name="monthlyRate"
                type="number"
                min="1"
                step="0.01"
                placeholder="1500"
                required
              />
            </label>

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
                : "Create owner and unit"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}