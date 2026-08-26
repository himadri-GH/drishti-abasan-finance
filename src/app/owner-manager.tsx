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
      <strong>{owners.length}</strong> owner records
    </div>
  );
}