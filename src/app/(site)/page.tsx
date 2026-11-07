import { auth } from "@clerk/nextjs/server";
import { HomeView } from "@/components/home-view";
import { Landing } from "@/components/landing";

export default async function HomePage() {
  const { userId } = await auth();
  return userId ? <HomeView /> : <Landing />;
}
