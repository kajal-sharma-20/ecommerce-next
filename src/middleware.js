import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  // Allow /admin/login without token
  if (req.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Protect other /admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login"; // redirect to login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
