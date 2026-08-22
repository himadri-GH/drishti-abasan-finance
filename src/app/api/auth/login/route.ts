import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const secret = () => new TextEncoder().encode(process.env.ADMIN_ACCESS_SECRET || "configure-admin-access-secret");
export async function POST(request: Request) {
  const body = await request.json();
  if (!process.env.ADMIN_PASSWORD || String(body.password ?? "") !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Incorrect administrator password." }, { status: 401 });
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret());
  const response = NextResponse.json({ ok: true });
  response.cookies.set("da_admin_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 8 * 60 * 60, path: "/" });
  return response;
}