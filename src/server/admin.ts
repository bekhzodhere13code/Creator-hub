import "server-only";
import { getSession, isAdminSession } from "./session";

/** Admin panelga faqat ADMIN_EMAILS dagi (Firebase’da tasdiqlangan) email egasi kira oladi. */
export async function isAdmin(): Promise<boolean> {
  return isAdminSession(await getSession());
}
