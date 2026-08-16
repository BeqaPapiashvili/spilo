import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/jwt";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "სისტემიდან გამოსვლა წარმატებით დასრულდა",
  });
  clearAuthCookie(response);
  return response;
}
