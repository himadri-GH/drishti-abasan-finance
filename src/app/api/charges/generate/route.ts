import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { monthlyCharges, ownershipContracts } from "@/db/schema";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json();
  const billingMonth = String(body.billingMonth ?? "").trim();
  const dueDate = String(body.dueDate ?? "").trim();
  if (!/^\d{4}-\d{2}$/.test(billingMonth) || !dueDate) return NextResponse.json({ error: "Choose a billing month and due date." }, { status: 400 });

  const contracts = await db.select({ id: ownershipContracts.id, monthlyRate: ownershipContracts.monthlyRate }).from(ownershipContracts).where(eq(ownershipContracts.status, "ACTIVE"));
  if (!contracts.length) return NextResponse.json({ error: "Add an active owner and unit before generating charges." }, { status: 400 });
  const rows = contracts.map((contract) => ({ id: crypto.randomUUID(), billingMonth, amountBilled: contract.monthlyRate, dueDate, isPaid: false, contractId: contract.id }));
  await db.insert(monthlyCharges).values(rows).onConflictDoNothing({ target: [monthlyCharges.contractId, monthlyCharges.billingMonth] });
  return NextResponse.json({ created: rows.length, billingMonth }, { status: 201 });
}