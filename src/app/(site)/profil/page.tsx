"use client";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHead } from "@/components/cards";
import { PortfolioManager, ProfileForm, SocialsForm } from "@/components/profile-forms";
import { TelegramCard } from "@/components/telegram-card";
import { useT } from "@/lib/i18n-client";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { t } = useT();
  const { me } = useStore();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHead title={t.profile.editTitle} action={me.account_type === "client" ? undefined : <Link href={`/creator/${me.id}`} className="btn btn-outline !py-2"><ExternalLink className="h-4 w-4" /> {t.profile.viewPublic}</Link>} />
      {/* key: saqlangan ma’lumot o‘zgarganda forma defaultValue’lari yangilansin */}
      <ProfileForm key={`p-${me.first_name}-${me.avatar_url?.length ?? 0}`} />
      <SocialsForm key={`s-${me.instagram}-${me.telegram}-${me.youtube}`} />
      <TelegramCard />
      {me.account_type !== "client" && <PortfolioManager />}
    </div>
  );
}
