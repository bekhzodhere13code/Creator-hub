import { isSpecialist, type AppRole } from "./roles";

export type NavItem = { href: string; label: string; icon: string };

// Barcha bo‘limlar slug'i. Keyingi bosqichlarda har biri alohida sahifaga aylanadi.
export const SECTIONS: Record<string, { title: string; specialistOnly?: boolean; description: string }> = {
  mobilograflar: { title: "Mobilograflar", description: "Mobilograflar katalogi 2-bosqichda qo‘shiladi." },
  "smm-mutaxassislari": { title: "SMM mutaxassislari", description: "SMM mutaxassislari katalogi 2-bosqichda qo‘shiladi." },
  portfolio: { title: "Portfolio", specialistOnly: true, description: "Portfolio yuklash 2-bosqichda qo‘shiladi." },
  xizmatlar: { title: "Xizmatlar", description: "Xizmatlar bo‘limi 2-bosqichda qo‘shiladi." },
  buyurtmalar: { title: "Buyurtmalar", description: "Buyurtmalar 3-bosqichda qo‘shiladi." },
  profil: { title: "Profil", description: "Profilni tahrirlash keyingi bosqichda qo‘shiladi." },
};

export function navForRole(role: AppRole): NavItem[] {
  const specialist = isSpecialist(role);
  const items: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: "home" },
    { href: "/mobilograflar", label: "Mobilograflar", icon: "camera" },
    { href: "/smm-mutaxassislari", label: "SMM mutaxassislari", icon: "trending" },
  ];
  if (specialist) items.push({ href: "/portfolio", label: "Portfolio", icon: "image" });
  items.push({ href: "/xizmatlar", label: specialist ? "Xizmatlarim" : "Xizmatlar", icon: "briefcase" });
  items.push({ href: "/buyurtmalar", label: "Buyurtmalar", icon: "receipt" });
  items.push({ href: "/profil", label: "Profil", icon: "user" });
  return items;
}
