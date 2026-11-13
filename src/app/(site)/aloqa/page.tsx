"use client";
import { Mail, Send } from "lucide-react";
import { PageHead } from "@/components/cards";
import { useT } from "@/lib/i18n-client";
import { normalizeUrl } from "@/lib/utils";

export default function ContactPage() {
  const { t } = useT();
  const tg = normalizeUrl(process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM, "telegram");
  const mail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const items = [
    { Icon: Send, label: t.extra.telegram, href: tg, text: process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM },
    { Icon: Mail, label: t.extra.email, href: mail ? `mailto:${mail}` : null, text: mail },
  ];
  return (
    <div className="mx-auto max-w-2xl">
      <PageHead title={t.extra.contactTitle} text={t.extra.contactText} />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ Icon, label, href, text }) => {
          const body = (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand"><Icon className="h-5 w-5" /></span>
              <span className="mt-3 block font-display font-bold">{label}</span>
              <span className="mt-1 block truncate text-sm text-ink-soft">{text || t.extra.notSet}</span>
            </>
          );
          return href
            ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="card card-hover p-5">{body}</a>
            : <div key={label} className="card p-5 opacity-70">{body}</div>;
        })}
      </div>
    </div>
  );
}
