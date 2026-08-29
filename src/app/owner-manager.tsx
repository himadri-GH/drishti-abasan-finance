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
  const [editing, setEditing] = useState<Owner | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

   const formData = Object.fromEntries(
  new FormData(event.currentTarget)
);

  const response = await fetch("/api/owners", {
    method: editing ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...formData,
      id: editing?.id,
    }),
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
              <h3>
                {editing ? "Edit owner" : "Add owner"}
              </h3>
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
              defaultValue={editing?.fullName ?? ""}
              required
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              defaultValue={editing?.phone ?? ""}
              required
            />
          </label>

          <label>
            Alternate Phone
            <input
              name="alternatePhone"
              defaultValue={editing?.alternatePhone ?? ""}
            />
          </label>

          <label>
            Email
        <input
          name="email"
          type="email"
          defaultValue={editing?.email ?? ""}
        />
          </label>

          <label>
            Permanent Address
            <textarea
              name="permanentAddress"
              rows={3}
              defaultValue={editing?.permanentAddress ?? ""}
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
              : editing
              ? "Save changes"
              : "Create owner"
            }
          </button>
        </form>
      </div>
    )}

    <div>
    
    <div className={styles.ownerTableHeader}>
      <strong>Owner</strong>
      <strong>Phone</strong>
      <strong>Email</strong>
      <strong>Actions</strong>
    </div>

    <div style={{ marginTop: "12px" }}>
      {owners.length ? (
        owners.map((owner) => (
          <div
            className={styles.ownerTableRow}
            key={owner.id}
          >
          
            <strong>
              {owner.fullName}
            </strong>
            <span>{owner.phone}</span>
            <span>
              {owner.email ?? "-"}
            </span>
            <span className={styles.adminRowActions}>
            <button
           className={styles.editButton}
          // className={styles.secondaryButton}
          //className={styles.ownerActionButton}
              type="button"
              onClick={() => {
                setEditing(owner);
                setOpen(true);
              }}
            >
              Edit
            </button>
                          
            <button
              className={styles.voidButton}
              //className={styles.ownerActionButton}
              type="button"
              onClick={async () => {
                if (
                  !window.confirm(
                    "Delete this owner?"
                  )
                )
                  return;

                const response = await fetch(
                  "/api/owners",
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body: JSON.stringify({
                      id: owner.id,
                    }),
                  }
                );

                const result =
                  await response.json();

                if (!response.ok) {
                  alert(
                    result.error ??
                      "Could not delete owner."
                  );
                  return;
                }

                window.location.reload();
              }}
            >
              Delete
            </button>
          </span>

            <br />
           
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