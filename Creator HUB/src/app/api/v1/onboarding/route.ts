import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { completeOnboarding, type OnboardingErrorCode } from "@/server/services/onboarding";

const STATUS_BY_CODE: Record<OnboardingErrorCode, number> = {
  validation: 400,
  role_locked: 409,
  clerk: 500,
  storage: 500,
};

// Kelajakdagi mobil ilova uchun: POST /api/v1/onboarding
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = await completeOnboarding(userId, body);
  return NextResponse.json(result, { status: result.ok ? 200 : STATUS_BY_CODE[result.code] });
}
