import { getSession } from "@/server/session";
import { HomeView } from "@/components/home-view";
import { Landing } from "@/components/landing";

export default async function HomePage() {
  const session = await getSession();
  return session ? <HomeView /> : <Landing />;
}
