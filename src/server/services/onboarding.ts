import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DB_ROLE, isRole, isSpecialist } from "@/lib/roles";
import { onboardingSchema } from "@/lib/validations";

export type OnboardingResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

/**
 * Rolni birinchi marta belgilaydi. Rol Clerk publicMetadata'ga FAQAT shu yerda (server) yoziladi
 * va keyin o‘zgartirib bo‘lmaydi. UI ham, kelajakdagi mobil API ham shu funksiyani chaqiradi.
 */
export async function completeOnboarding(clerkUserId: string, raw: unknown): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Ma’lumotlarni tekshirib qayta urinib ko‘ring.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const input = parsed.data;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);

  if (isRole(clerkUser.publicMetadata?.role)) {
    return { ok: false, error: "Rol allaqachon tanlangan va uni o‘zgartirib bo‘lmaydi." };
  }

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? "";
  const dbRole = DB_ROLE[input.role];

  // Baza hali ulanmagan bo‘lsa (DATABASE_URL yo‘q) DB yozuvi o‘tkazib yuboriladi: rol baribir Clerk'ga
  // yoziladi va ilova ishlaydi. Baza ulangach profil ma’lumotlari keyingi bosqichda to‘ldiriladi.
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  if (!hasDatabase) console.warn("[onboarding] DATABASE_URL topilmadi: DB yozuvi o‘tkazib yuborildi.");

  try {
    // Avval DB (idempotent upsert), so‘ng Clerk metadata. Clerk yozilmay qolsa, qayta urinish xavfsiz.
    if (hasDatabase) await db.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { clerkId: clerkUserId },
        create: {
          clerkId: clerkUserId,
          email,
          fullName: input.fullName,
          role: dbRole,
          city: input.city || null,
        },
        update: { fullName: input.fullName, role: dbRole, city: input.city || null },
      });

      if (isSpecialist(input.role)) {
        const profile = {
          experience: input.experience!,
          bio: input.bio || null,
          instagramUrl: input.instagramUrl || null,
        };
        await tx.masterProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, ...profile },
          update: profile,
        });
      }
    });

    const [firstName, ...rest] = input.fullName.split(/\s+/);
    await client.users.updateUser(clerkUserId, {
      firstName,
      lastName: rest.join(" ") || undefined,
      publicMetadata: { ...clerkUser.publicMetadata, role: input.role },
    });
  } catch (error) {
    console.error("[onboarding] xatolik:", error);
    return { ok: false, error: "Saqlashda xatolik yuz berdi. Birozdan keyin qayta urinib ko‘ring." };
  }

  return { ok: true };
}
