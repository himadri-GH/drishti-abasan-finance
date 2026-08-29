import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { propertyUnits } from "@/db/schema";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ unitId: string }> }
) {
  if (!db) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 }
    );
  }

  const { unitId } = await context.params;
  const body = await request.json();

  const unitCode = String(
    body.unitCode ?? ""
  ).trim().toUpperCase();

  if (!unitCode) {
    return NextResponse.json(
      { error: "Unit code is required." },
      { status: 400 }
    );
  }

  try {
    await db
      .update(propertyUnits)
      .set({
        unitCode,
        unitType: String(body.unitType ?? "FLAT"),
        block:
          String(body.block ?? "").trim() || null,
        floorNumber: body.floorNumber
          ? Number(body.floorNumber)
          : null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(propertyUnits.id, unitId));

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Could not update this unit.",
      },
      { status: 409 }
    );
  }
}