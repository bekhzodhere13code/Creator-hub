"use server";

import { auth } from "@clerk/nextjs/server";
import { completeOnboarding, type OnboardingResult } from "@/server/services/onboarding";

export async function submitOnboarding(input: unknown): Promise<OnboardingResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Avval tizimga kiring." };
  return completeOnboarding(userId, input);
}
