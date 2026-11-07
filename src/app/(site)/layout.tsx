import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app-shell";
import { BackendNotice } from "@/components/notices";
import { PublicShell } from "@/components/public-shell";
import { StoreProvider } from "@/lib/store";
import { loadAppData } from "@/server/data";
import { hasBackend } from "@/server/supabase";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) return <PublicShell>{children}</PublicShell>;
  if (!hasBackend()) return <BackendNotice kind="setup" />;
  let snapshot;
  try {
    snapshot = await loadAppData(userId);
  } catch (e) {
    console.error("[layout] loadAppData", e);
    return <BackendNotice kind="error" />;
  }
  return (
    <StoreProvider snapshot={snapshot}>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
