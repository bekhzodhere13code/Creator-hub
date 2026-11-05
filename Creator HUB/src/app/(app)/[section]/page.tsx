import { notFound } from "next/navigation";
import { EmptyState } from "@/components/dashboard/dashboard-header";
import { requireRoleUser } from "@/lib/auth";
import { SECTIONS } from "@/lib/nav";
import { isSpecialist } from "@/lib/roles";

// 2-3 bosqichgacha vaqtinchalik sahifa. Rolga mos bo‘lmagan bo‘lim 404 beradi.
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const user = await requireRoleUser();
  const meta = SECTIONS[section];
  if (!meta || (meta.specialistOnly && !isSpecialist(user.role))) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{meta.title}</h1>
      <EmptyState title="Tez orada" text={meta.description} />
    </div>
  );
}
