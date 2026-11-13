import { redirect } from "next/navigation";
import { TgEntry } from "@/components/tg-entry";
import { getSession } from "@/server/session";

export const metadata = { title: "Creator Hub" };

export default async function TgPage() {
  if (await getSession()) redirect("/");
  return <TgEntry />;
}
