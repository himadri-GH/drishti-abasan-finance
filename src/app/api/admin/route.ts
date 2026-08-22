import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { blocks, expenseLedger, societies, vendorStaff } from "@/db/schema";

const tableFor = (type: string) => type === "block" ? blocks : type === "vendor" ? vendorStaff : null;

export async function GET(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const type = new URL(request.url).searchParams.get("type");
  if (type === "society") return NextResponse.json(await db.select().from(societies).limit(1));
  if (type === "block") return NextResponse.json(await db.select().from(blocks));
  if (type === "vendor") return NextResponse.json(await db.select().from(vendorStaff));
  return NextResponse.json({ error: "Unknown record type." }, { status: 400 });
}

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json();
  const type = String(body.type ?? "");
  const society = await db.select({ id: societies.id }).from(societies).limit(1);
  let societyId = society[0]?.id;
  if (!societyId && type === "society") { societyId = crypto.randomUUID(); await db.insert(societies).values({ id: societyId, name: String(body.name).trim(), registrationNo: body.registrationNo || null, address: body.address || null, currency: "INR" }); }
  if (!societyId) return NextResponse.json({ error: "Create society settings first." }, { status: 400 });
  if (type === "block") { const name = String(body.name ?? "").trim(); if (!name) return NextResponse.json({ error: "Block name is required." }, { status: 400 }); await db.insert(blocks).values({ id: crypto.randomUUID(), societyId, name, description: body.description || null }); }
  else if (type === "vendor") { const name = String(body.name ?? "").trim(); if (!name) return NextResponse.json({ error: "Vendor/staff name is required." }, { status: 400 }); await db.insert(vendorStaff).values({ id: crypto.randomUUID(), societyId, name, role: String(body.role ?? "OTHER"), phone: body.phone || null, monthlySalary: body.monthlySalary ? Number(body.monthlySalary) : null }); }
  else if (type !== "society") return NextResponse.json({ error: "Unknown record type." }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json(); const type = String(body.type ?? "");
  if (type === "society") { const row = await db.select({ id: societies.id }).from(societies).limit(1); if (!row[0]) return NextResponse.json({ error: "Society not found." }, { status: 404 }); await db.update(societies).set({ name: String(body.name).trim(), registrationNo: body.registrationNo || null, address: body.address || null, updatedAt: new Date().toISOString() }).where(eq(societies.id, row[0].id)); return NextResponse.json({ ok: true }); }
  const table = tableFor(type); if (!table || !body.id) return NextResponse.json({ error: "Invalid record." }, { status: 400 });
  if (type === "block") await db.update(blocks).set({ name: String(body.name).trim(), description: body.description || null, updatedAt: new Date().toISOString() }).where(eq(blocks.id, body.id));
  else await db.update(vendorStaff).set({ name: String(body.name).trim(), role: String(body.role ?? "OTHER"), phone: body.phone || null, monthlySalary: body.monthlySalary ? Number(body.monthlySalary) : null, status: String(body.status ?? "ACTIVE"), updatedAt: new Date().toISOString() }).where(eq(vendorStaff.id, body.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json(); const table = tableFor(String(body.type ?? "")); if (!table || !body.id) return NextResponse.json({ error: "Invalid record." }, { status: 400 });
  if (body.type === "block") await db.delete(blocks).where(eq(blocks.id, body.id));
  else {
    const linked = await db.select({ id: expenseLedger.id }).from(expenseLedger).where(eq(expenseLedger.vendorId, body.id)).limit(1);
    if (linked[0]) return NextResponse.json({ error: "This vendor is linked to an expense and cannot be deleted. Deactivate it instead." }, { status: 409 });
    await db.delete(vendorStaff).where(eq(vendorStaff.id, body.id));
  }
  return NextResponse.json({ ok: true });
}