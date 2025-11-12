// src/app/api/verifyotp/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export async function POST(req) {
  try {
    const body = await req.json();

    //  Send POST request to your backend using Axios
    const { data } = await axios.post(
      `${API_URL}/verifyotp`,
      body,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    //  If backend sends a token, set it as cookie
    if (data.token) {
      const response = NextResponse.json(data);
      response.cookies.set("token", data.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return response;
    }

    // Return the backend response if no token found
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error verifying OTP:", error.message);

    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: error.response?.status || 500 }
    );
  }
}
