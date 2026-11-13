import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/", "/aloqa", "/sign-in", "/sign-up", "/api/telegram/webhook", "/api/telegram/setup", "/api/auth/session", "/api/auth/logout", "/api/auth/telegram", "/tg", "/api/tg/auth"];
const isPublic = (p: string) => PUBLIC.some((x) => p === x || (x !== "/" && p.startsWith(x + "/")));

// Edge’da faqat cookie borligi tekshiriladi; haqiqiy tekshiruv serverda (getSession).
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname) || req.cookies.get("__session")) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/sign-in";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
