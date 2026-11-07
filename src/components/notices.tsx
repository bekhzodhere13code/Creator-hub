"use client";
import { Notice } from "./public-shell";
import { useT } from "@/lib/i18n-client";

export function BackendNotice({ kind }: { kind: "setup" | "error" }) {
  const { t } = useT();
  return kind === "setup"
    ? <Notice title={t.onboard.backendTitle} text={t.onboard.backendText} />
    : <Notice title={t.onboard.errorTitle} text={t.onboard.errorText} retry={t.onboard.retry} />;
}
