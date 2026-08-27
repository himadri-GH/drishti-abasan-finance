"use client";

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
  return (
  <div>
    <span>
      <strong>{owners.length}</strong> owner records
    </span>

    <div style={{ marginTop: "12px" }}>
      {owners.length ? (
        owners.map((owner) => (
          <div key={owner.id}>
            <strong>{owner.fullName}</strong>
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
);
}