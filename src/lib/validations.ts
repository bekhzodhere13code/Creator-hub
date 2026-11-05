import { z } from "zod";
import { EXPERIENCE_OPTIONS, ROLES, isSpecialist } from "./roles";

const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?(\?.*)?$/i;

export const onboardingSchema = z
  .object({
    role: z.enum(ROLES, { errorMap: () => ({ message: "Rolni tanlang" }) }),
    fullName: z.string().trim().min(3, "Ism va familiyani kiriting").max(80, "Ism juda uzun"),
    city: z.string().trim().max(60).optional().or(z.literal("")),
    experience: z.enum(EXPERIENCE_OPTIONS).optional(),
    bio: z.string().trim().max(500, "Eng ko‘pi bilan 500 belgi").optional().or(z.literal("")),
    instagramUrl: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!isSpecialist(data.role)) return;
    if (!data.experience) {
      ctx.addIssue({ code: "custom", path: ["experience"], message: "Tajriba muddatini tanlang" });
    }
    if (!data.instagramUrl) {
      ctx.addIssue({ code: "custom", path: ["instagramUrl"], message: "Instagram havolasini kiriting" });
    } else if (!instagramRegex.test(data.instagramUrl)) {
      ctx.addIssue({
        code: "custom",
        path: ["instagramUrl"],
        message: "Havola https://instagram.com/username ko‘rinishida bo‘lsin",
      });
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;
