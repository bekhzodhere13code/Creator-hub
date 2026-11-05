export const ROLES = ["mobilograf", "smm", "mijoz"] as const;
export type AppRole = (typeof ROLES)[number];

export function isRole(value: unknown): value is AppRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export const isSpecialist = (role: AppRole) => role === "mobilograf" || role === "smm";

export const ROLE_LABEL: Record<AppRole, string> = {
  mobilograf: "Mobilograf",
  smm: "SMM mutaxassisi",
  mijoz: "Mijoz",
};

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  mobilograf: "Xizmat sotaman va boshqalardan sotib olaman",
  smm: "Xizmat sotaman va boshqalardan sotib olaman",
  mijoz: "Xizmatlarni ko‘raman va buyurtma beraman",
};

// Prisma enum bilan moslik (UserRole)
export const DB_ROLE = { mobilograf: "MOBILOGRAF", smm: "SMM", mijoz: "MIJOZ" } as const;

export const EXPERIENCE_OPTIONS = ["1 yilgacha", "1–3 yil", "3–5 yil", "5 yildan ortiq"] as const;
