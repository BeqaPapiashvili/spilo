import { NextResponse } from "next/server";
import { getDeliverySettings } from "@/lib/delivery";

export async function GET() {
  try {
    const settings = await getDeliverySettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მიწოდების ტარიფები ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
