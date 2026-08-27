"use client";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type Owner = {
  id: string;
  fullName: string;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  permanentAddress: string | null;
};

export function OwnerManager({
  owners,
}: {
  owners: Owner[];
}) {
    const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const response = await fetch("/api/owners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        Object.fromEntries(new FormData(event.currentTarget))
      ),
    });

    const result = await response.json();

    setSaving(false);

    if (!response.ok) {
      setMessage(
        result.error ?? "Could not create owner."
      );
      return;
    }

    window.location.reload();
  }
  return (
  <>
    <button
      className={styles.primaryButton}
      onClick={() => setOpen(true)}
    >
      ＋ Add Owner
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
                Owner registry
              </p>
              <h3>Add owner</h3>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <label>
            Full name
            <input
              name="fullName"
              required
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              required
            />
          </label>

          <label>
            Alternate Phone
            <input
              name="alternatePhone"
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
            />
          </label>

          <label>
            Permanent Address
            <textarea
              name="permanentAddress"
              rows={3}
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
            {saving ? "Saving..." : "Create owner"}
          </button>
        </form>
      </div>
    )}

    <div>
    <span>
      <strong>{owners.length}</strong> owner records
    </span>

    <div style={{ marginTop: "12px" }}>
      {owners.length ? (
        owners.map((owner) => (
          <div key={owner.id}>
                      <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <strong>{owner.fullName}</strong>

            <button
              type="button"
              onClick={() => {
                console.log(owner);
              }}
            >
              Edit
            </button>
          </div>

            <br />
            <small>
              {owner.phone}
              {owner.email ? ` • ${owner.email}` : ""}
            </small>
          </div>
        ))
      ) : (
        <p>No owners yet.</p>
      )}
    </div>
  </div>
  </>
);
}