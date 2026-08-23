import { NextResponse } from "next/server";
import { db } from "@/db";
import { owners, ownershipContracts, propertyUnits, societies } from "@/db/schema";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const unitCode = String(body.unitCode ?? "").trim().toUpperCase();
  const monthlyRate = Number(body.monthlyRate);
  if (!fullName || !phone || !unitCode || !Number.isFinite(monthlyRate) || monthlyRate <= 0) {
    return NextResponse.json({ error: "Enter the owner, phone, unit code, and a positive monthly rate." }, { status: 400 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      const existingSociety = await tx.select({ id: societies.id }).from(societies).limit(1);
      const societyId = existingSociety[0]?.id ?? crypto.randomUUID();
      if (!existingSociety[0]) {
        await tx.insert(societies).values({ id: societyId, name: "Drishti Abasan", currency: "INR" });
      }
      const ownerId = crypto.randomUUID();
      const unitId = crypto.randomUUID();
      const contractId = crypto.randomUUID();
      await tx.insert(owners).values({id: ownerId, societyId, fullName, phone, email: email || null});
      await tx.insert(propertyUnits).values({ id: unitId, societyId, unitCode, unitType: String(body.unitType ?? "FLAT"), block: String(body.block ?? "").trim() || null, floorNumber: body.floorNumber ? Number(body.floorNumber) : null });
      await tx.insert(ownershipContracts).values({ id: contractId, societyId, contractCode: `CTR-${unitCode}-${new Date().getFullYear()}`, status: "ACTIVE", occupancyType: String(body.occupancyType ?? "SELF_OCCUPIED"), startDate: new Date().toISOString().slice(0, 10), monthlyRate, openingBalance: 0, ownerId, propertyUnitId: unitId });
      return { unitCode, fullName };
    });
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That unit may already exist. Check the unit code and try again." }, { status: 409 });
  }
}