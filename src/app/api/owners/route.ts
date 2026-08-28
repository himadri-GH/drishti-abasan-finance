import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { owners, societies } from "@/db/schema";

export async function GET() {
  if (!db) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 }
    );
  }

  const rows = await db
    .select()
    .from(owners)
    .orderBy(asc(owners.fullName));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 }
    );
  }

  const body = await request.json();

  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const alternatePhone = String(body.alternatePhone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const permanentAddress = String(body.permanentAddress ?? "").trim();

  if (!fullName || !phone) {
    return NextResponse.json(
      { error: "Owner name and phone are required." },
      { status: 400 }
    );
  }

  const society = await db
    .select({ id: societies.id })
    .from(societies)
    .limit(1);

  if (!society[0]) {
    return NextResponse.json(
      { error: "Create society settings first." },
      { status: 400 }
    );
  }

  await db.insert(owners).values({
    id: crypto.randomUUID(),
    societyId: society[0].id,
    fullName,
    phone,
    alternatePhone: alternatePhone || null,
    email: email || null,
    permanentAddress: permanentAddress || null,
  });

  return NextResponse.json(
    { ok: true },
    { status: 201 }
  );
  
}
export async function PATCH(request: Request) {
  if (!db) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 }
    );
  }

  const body = await request.json();

  if (!body.id) {
    return NextResponse.json(
      { error: "Owner ID is required." },
      { status: 400 }
    );
  }

  await db
    .update(owners)
    .set({
      fullName: String(body.fullName ?? "").trim(),
      phone: String(body.phone ?? "").trim(),
      alternatePhone:
        String(body.alternatePhone ?? "").trim() || null,
      email:
        String(body.email ?? "").trim() || null,
      permanentAddress:
        String(body.permanentAddress ?? "").trim() || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(owners.id, body.id));

  return NextResponse.json({ ok: true });
}