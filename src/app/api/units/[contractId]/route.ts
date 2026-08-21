import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { owners, ownershipContracts, propertyUnits } from "@/db/schema";

export async function PATCH(request: Request, context: { params: Promise<{ contractId: string }> }) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const { contractId } = await context.params;
  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const unitCode = String(body.unitCode ?? "").trim().toUpperCase();
  const monthlyRate = Number(body.monthlyRate);
  if (!fullName || !phone || !unitCode || !Number.isFinite(monthlyRate) || monthlyRate <= 0) return NextResponse.json({ error: "Complete all required fields." }, { status: 400 });
  try {
    await db.transaction(async (tx) => {
      const contract = await tx.select({ ownerId: ownershipContracts.ownerId, propertyUnitId: ownershipContracts.propertyUnitId }).from(ownershipContracts).where(eq(ownershipContracts.id, contractId)).limit(1);
      if (!contract[0]) throw new Error("missing");
      await tx.update(owners).set({ fullName, phone, updatedAt: new Date().toISOString() }).where(eq(owners.id, contract[0].ownerId));
      await tx.update(propertyUnits).set({ unitCode, unitType: String(body.unitType ?? "FLAT"), block: String(body.block ?? "").trim() || null, floorNumber: body.floorNumber ? Number(body.floorNumber) : null, updatedAt: new Date().toISOString() }).where(eq(propertyUnits.id, contract[0].propertyUnitId));
      await tx.update(ownershipContracts).set({ monthlyRate, updatedAt: new Date().toISOString() }).where(eq(ownershipContracts.id, contractId));
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update this unit. Check that the unit code is unique." }, { status: 409 });
  }
}