import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// GET /api/v1/me — joriy foydalanuvchi va roli
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
