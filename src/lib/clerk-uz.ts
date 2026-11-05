import type { LocalizationResource } from "@clerk/types";

/** Clerk komponentlari uchun o‘zbekcha matnlar. Kerak bo‘lsa kalitlarni kengaytiring. */
export const uzLocalization = {
  locale: "uz-UZ",
  formButtonPrimary: "Davom etish",
  formFieldLabel__emailAddress: "Email",
  formFieldLabel__password: "Parol",
  formFieldLabel__firstName: "Ism",
  formFieldLabel__lastName: "Familiya",
  formFieldInputPlaceholder__emailAddress: "email@misol.uz",
  formFieldInputPlaceholder__password: "Kamida 8 ta belgi",
  formFieldInputPlaceholder__firstName: "Ism",
  formFieldInputPlaceholder__lastName: "Familiya",
  formFieldAction__forgotPassword: "Parolni unutdingizmi?",
  dividerText: "yoki",
  footerActionLink__useAnotherMethod: "Boshqa usuldan foydalanish",
  backButton: "Orqaga",
  socialButtonsBlockButton: "{{provider|titleize}} orqali davom etish",
  signIn: {
    start: {
      title: "Kirish",
      subtitle: "Hisobingizga kiring va davom eting",
      actionText: "Hisobingiz yo‘qmi?",
      actionLink: "Ro‘yxatdan o‘ting",
    },
    password: { title: "Parolni kiriting", subtitle: "Davom etish uchun parolingizni kiriting" },
    emailCode: {
      title: "Emailingizni tekshiring",
      subtitle: "Davom etish uchun kodni kiriting",
      formTitle: "Tasdiqlash kodi",
      formSubtitle: "Emailingizga yuborilgan kodni kiriting",
      resendButton: "Kod kelmadimi? Qayta yuborish",
    },
  },
  signUp: {
    start: {
      title: "Ro‘yxatdan o‘tish",
      subtitle: "Hisob yarating va platformadan foydalaning",
      actionText: "Hisobingiz bormi?",
      actionLink: "Kirish",
    },
    emailCode: {
      title: "Emailingizni tasdiqlang",
      subtitle: "Emailingizga yuborilgan kodni kiriting",
      formTitle: "Tasdiqlash kodi",
      formSubtitle: "Emailingizga yuborilgan 6 xonali kodni kiriting",
      resendButton: "Kod kelmadimi? Qayta yuborish",
    },
  },
  unstable__errors: {
    form_identifier_not_found: "Bu email bilan hisob topilmadi.",
    form_password_incorrect: "Parol noto‘g‘ri.",
    form_password_length_too_short: "Parol kamida 8 ta belgidan iborat bo‘lishi kerak.",
    form_password_pwned: "Bu parol oson topiladi. Boshqa parol tanlang.",
    form_identifier_exists: "Bu email allaqachon ro‘yxatdan o‘tgan.",
    form_code_incorrect: "Kod noto‘g‘ri.",
    form_param_format_invalid: "Kiritilgan qiymat noto‘g‘ri formatda.",
    form_param_nil: "Bu maydon to‘ldirilishi shart.",
    too_many_requests: "Juda ko‘p urinish. Birozdan keyin qayta urinib ko‘ring.",
    session_exists: "Siz allaqachon tizimdasiz.",
  },
} as unknown as LocalizationResource;
