import { NextResponse } from "next/server";

export function middleware(req) {
  // Get token from cookies
  const token = req.cookies.get("token")?.value;

  // If no token, redirect to login page
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/"; // your login page
    return NextResponse.redirect(url);
  }

  // If token exists, continue
  return NextResponse.next();
}

// Protect all /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
