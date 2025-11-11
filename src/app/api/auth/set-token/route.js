import { NextResponse } from "next/server";
import cookie from "cookie";

export async function POST(req) {
  const { token } = await req.json();

  if (!token) return NextResponse.json({ message: "Token is required" }, { status: 400 });

  const headers = {
    "Set-Cookie": cookie.serialize("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // cross-domain
      path: "/",
      maxAge: 2 * 24 * 60 * 60, // 2 days
    }),
  };

  return NextResponse.json({ message: "Token set" }, { headers });
}
