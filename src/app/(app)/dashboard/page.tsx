import type { Metadata } from "next";
import { ClientHome } from "@/components/dashboard/client-home";
import { SpecialistHome } from "@/components/dashboard/specialist-home";
import { requireRoleUser } from "@/lib/auth";
import { isSpecialist } from "@/lib/roles";

export const metadata: Metadata = { title: "Home" };

export default async function DashboardPage() {
  const user = await requireRoleUser();
  return isSpecialist(user.role) ? (
    <SpecialistHome name={user.name} role={user.role} userId={user.id} />
  ) : (
    <ClientHome name={user.name} />
  );
}
