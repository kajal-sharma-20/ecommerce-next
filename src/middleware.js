// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  

  if (!token) {
    return NextResponse.redirect("https://ecommerce-react-three-psi.vercel.app");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // Protect all /admin routes
};
