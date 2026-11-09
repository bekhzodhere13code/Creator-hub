import "server-only";
import { currentUser } from "@clerk/nextjs/server";

/** Admin panelga faqat shu (tasdiqlangan) Clerk email egasi kira oladi. */
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "bekhzod.here13@gmail.com").toLowerCase();

export async function isAdmin(): Promise<boolean> {
  const u = await currentUser();
  if (!u) return false;
  const primary = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId);
  return Boolean(primary && primary.verification?.status === "verified" && primary.emailAddress.toLowerCase() === ADMIN_EMAIL);
}
