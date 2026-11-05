import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isRole, type AppRole } from "./roles";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: AppRole | null;
};

/** Rol faqat Clerk publicMetadata'dan o‘qiladi (u faqat server tomonda yoziladi). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await currentUser();
  if (!user) return null;
  const rawRole = user.publicMetadata?.role;
  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? "";
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || email.split("@")[0] || "Foydalanuvchi";
  return { id: user.id, name, email, imageUrl: user.imageUrl, role: isRole(rawRole) ? rawRole : null };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** Login qilgan VA roli tanlangan foydalanuvchi. Roli yo‘q bo‘lsa onboarding'ga yuboradi. */
export async function requireRoleUser(): Promise<SessionUser & { role: AppRole }> {
  const user = await requireSessionUser();
  if (!user.role) redirect("/onboarding");
  return user as SessionUser & { role: AppRole };
}
