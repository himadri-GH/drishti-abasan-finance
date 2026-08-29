import { NextResponse } from "next/server";
import { db } from "@/db";
import { propertyUnits, societies } from "@/db/schema";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json();
  
  const unitCode = String(body.unitCode ?? "").trim().toUpperCase();
  
  if (!unitCode) {
  return NextResponse.json(
    { error: "Unit code is required." },
    { status: 400 }
  );
}

  try {
    const result = await db.transaction(async (tx) => {
      const existingSociety = await tx.select({ id: societies.id }).from(societies).limit(1);
      const societyId = existingSociety[0]?.id ?? crypto.randomUUID();

      if (!existingSociety[0]) {
        await tx.insert(societies).values({ id: societyId, name: "Drishti Abasan", currency: "INR" });
      }
      
      const unitId = crypto.randomUUID();
      
      
      await tx.insert(propertyUnits).values({ id: unitId, societyId, unitCode, unitType: String(body.unitType ?? "FLAT"), block: String(body.block ?? "").trim() || null, floorNumber: body.floorNumber ? Number(body.floorNumber) : null });
      
      return { unitCode };
    });
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That unit may already exist. Check the unit code and try again." }, { status: 409 });
  }
}