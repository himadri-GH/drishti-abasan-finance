import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/admin", "/collections", "/expenses", "/reports", "/settings", "/staff", "/units", "/api/"];
const secret = () => new TextEncoder().encode(process.env.ADMIN_ACCESS_SECRET || "configure-admin-access-secret");

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/login" || path === "/api/auth/login" || path.startsWith("/_next") || path === "/manifest.webmanifest" || path === "/icon.svg") return NextResponse.next();
  if (!protectedPaths.some((prefix) => path === prefix || path.startsWith(prefix))) return NextResponse.next();
  const token = request.cookies.get("da_admin_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  try { await jwtVerify(token, secret()); return NextResponse.next(); } catch { return NextResponse.redirect(new URL("/login", request.url)); }
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
