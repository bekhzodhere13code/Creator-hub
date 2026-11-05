import { AppShell } from "@/components/layout/app-shell";
import { requireRoleUser } from "@/lib/auth";
import { navForRole } from "@/lib/nav";
import { ROLE_LABEL } from "@/lib/roles";

export const dynamic = "force-dynamic";

// Himoya: login qilmagan -> /sign-in, roli yo‘q -> /onboarding
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRoleUser();
  return (
    <AppShell nav={navForRole(user.role)} name={user.name} roleLabel={ROLE_LABEL[user.role]}>
      {children}
    </AppShell>
  );
}
