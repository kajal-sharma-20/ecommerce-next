import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();

  // Protect only admin routes
  if (url.pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;
    console.log(token,"token of middle ware ")

    // If no token, redirect to login page
    if (!token) {
        console.log("no token ")
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Allow request to continue if token exists
  return NextResponse.next();
}

// Apply middleware only to /admin/* routes
export const config = {
  matcher: ["/admin/:path*"],
};
