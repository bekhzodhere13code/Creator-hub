"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { useT } from "@/lib/i18n-client";
import { resetPassword, signInEmail, signInGoogle, signInWithTelegramToken, signUpEmail } from "@/lib/firebase-client";

type L = "uz" | "ru" | "en";
const TX = {
  uz: { inT: "Kirish", inS: "Hisobingizga kiring va davom eting", upT: "Ro‘yxatdan o‘tish", upS: "Bir daqiqada profil yarating", google: "Google orqali davom etish", or: "yoki", name: "Ism", email: "Email", pass: "Parol", passHint: "Kamida 6 ta belgi", go: "Davom etish", forgot: "Parolni unutdingizmi?", noAcc: "Hisobingiz yo‘qmi?", haveAcc: "Hisobingiz bormi?", toUp: "Ro‘yxatdan o‘ting", toIn: "Kiring", sent: "Parolni tiklash havolasi emailingizga yuborildi.", needEmail: "Avval emailingizni kiriting.",
    e: { "auth/invalid-credential": "Email yoki parol noto‘g‘ri.", "auth/wrong-password": "Parol noto‘g‘ri.", "auth/user-not-found": "Bunday foydalanuvchi topilmadi.", "auth/email-already-in-use": "Bu email allaqachon ro‘yxatdan o‘tgan.", "auth/weak-password": "Parol juda oddiy (kamida 6 ta belgi).", "auth/invalid-email": "Email noto‘g‘ri yozilgan.", "auth/too-many-requests": "Juda ko‘p urinish. Birozdan keyin qayta urining.", "auth/network-request-failed": "Internet aloqasi yo‘q.", "auth/popup-closed-by-user": "", "auth/cancelled-popup-request": "", other: "Xatolik yuz berdi. Qayta urinib ko‘ring." } },
  ru: { inT: "Вход", inS: "Войдите в аккаунт, чтобы продолжить", upT: "Регистрация", upS: "Создайте профиль за минуту", google: "Продолжить через Google", or: "или", name: "Имя", email: "Email", pass: "Пароль", passHint: "Минимум 6 символов", go: "Продолжить", forgot: "Забыли пароль?", noAcc: "Нет аккаунта?", haveAcc: "Уже есть аккаунт?", toUp: "Зарегистрируйтесь", toIn: "Войдите", sent: "Ссылка для сброса пароля отправлена на email.", needEmail: "Сначала введите email.",
    e: { "auth/invalid-credential": "Неверный email или пароль.", "auth/wrong-password": "Неверный пароль.", "auth/user-not-found": "Пользователь не найден.", "auth/email-already-in-use": "Этот email уже зарегистрирован.", "auth/weak-password": "Слишком простой пароль (минимум 6 символов).", "auth/invalid-email": "Неверный email.", "auth/too-many-requests": "Слишком много попыток. Попробуйте позже.", "auth/network-request-failed": "Нет подключения к интернету.", "auth/popup-closed-by-user": "", "auth/cancelled-popup-request": "", other: "Произошла ошибка. Попробуйте снова." } },
  en: { inT: "Sign in", inS: "Sign in to your account to continue", upT: "Sign up", upS: "Create your profile in a minute", google: "Continue with Google", or: "or", name: "Name", email: "Email", pass: "Password", passHint: "At least 6 characters", go: "Continue", forgot: "Forgot password?", noAcc: "No account?", haveAcc: "Already have an account?", toUp: "Sign up", toIn: "Sign in", sent: "A password reset link was sent to your email.", needEmail: "Enter your email first.",
    e: { "auth/invalid-credential": "Wrong email or password.", "auth/wrong-password": "Wrong password.", "auth/user-not-found": "User not found.", "auth/email-already-in-use": "This email is already registered.", "auth/weak-password": "Password is too weak (min 6 characters).", "auth/invalid-email": "Invalid email.", "auth/too-many-requests": "Too many attempts. Try again later.", "auth/network-request-failed": "No internet connection.", "auth/popup-closed-by-user": "", "auth/cancelled-popup-request": "", other: "Something went wrong. Please try again." } },
} as const;

const TG = {
  uz: { btn: "Telegram orqali kirish", wait: "Telegram ochiladi. Botda «Ha, kirish» tugmasini bosing, keyin shu sahifaga qayting.", open: "Telegram ochilmadimi? Bu yerni bosing", cancel: "Bekor qilish", expired: "Vaqt tugadi. Qaytadan urinib ko‘ring.", fail: "Telegram orqali kirib bo‘lmadi.", inApp: "Telegram ichidagi brauzerda Google ishlamaydi. Telegram tugmasidan yoki email’dan foydalaning." },
  ru: { btn: "Войти через Telegram", wait: "Откроется Telegram. Нажмите в боте «Да, войти» и вернитесь на эту страницу.", open: "Telegram не открылся? Нажмите здесь", cancel: "Отмена", expired: "Время истекло. Попробуйте снова.", fail: "Не удалось войти через Telegram.", inApp: "Google не работает во встроенном браузере Telegram. Используйте кнопку Telegram или email." },
  en: { btn: "Continue with Telegram", wait: "Telegram will open. Tap “Yes, sign in” in the bot, then come back to this page.", open: "Telegram didn’t open? Tap here", cancel: "Cancel", expired: "Time ran out. Please try again.", fail: "Couldn’t sign in with Telegram.", inApp: "Google doesn’t work inside Telegram’s built-in browser. Use the Telegram button or email." },
} as const;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.600 48 24 48z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "in" | "up" }) {
  const { lang } = useT();
  const x = TX[(lang as L) in TX ? (lang as L) : "uz"];
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const tx = TG[(lang as L) in TG ? (lang as L) : "uz"];
  const [tgUrl, setTgUrl] = useState("");
  const [inApp, setInApp] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTg = () => { if (timer.current) clearInterval(timer.current); timer.current = null; setTgUrl(""); };
  useEffect(() => {
    setInApp(/Telegram|Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent) || Boolean((window as unknown as { TelegramWebviewProxy?: unknown }).TelegramWebviewProxy));
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const tgLogin = async () => {
    setError(""); setInfo(""); setBusy(true);
    try {
      const r = await fetch("/api/auth/telegram/start", { method: "POST" });
      const { code, url } = (await r.json()) as { code?: string; url?: string };
      if (!r.ok || !code || !url) throw new Error("start");
      setTgUrl(url);
      window.open(url, "_blank", "noopener");
      const until = Date.now() + 10 * 60 * 1000;
      timer.current = setInterval(async () => {
        if (Date.now() > until) { stopTg(); setError(tx.expired); return; }
        try {
          const p = await fetch(`/api/auth/telegram/poll?code=${encodeURIComponent(code)}`, { cache: "no-store" });
          const d = (await p.json()) as { status: string; token?: string };
          if (d.status === "ok" && d.token) {
            stopTg();
            await signInWithTelegramToken(d.token);
            router.replace("/"); router.refresh();
          } else if (d.status === "expired") { stopTg(); setError(tx.expired); }
        } catch { /* tarmoq xatosi: keyingi urinishda qayta */ }
      }, 2000);
    } catch { setError(tx.fail); } finally { setBusy(false); }
  };


  const fail = (e: unknown) => {
    const code = (e as { code?: string })?.code ?? "";
    const map = x.e as Record<string, string>;
    setError(code in map ? map[code] : map.other);
  };
  const run = async (fn: () => Promise<void>) => {
    setError(""); setInfo(""); setBusy(true);
    try { await fn(); router.replace("/"); router.refresh(); } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    void run(() => (mode === "up" ? signUpEmail(name.trim(), email.trim(), password) : signInEmail(email.trim(), password)));
  };
  const forgot = async () => {
    setError(""); setInfo("");
    if (!email.trim()) { setError(x.needEmail); return; }
    try { await resetPassword(email.trim()); setInfo(x.sent); } catch (e) { fail(e); }
  };

  return (
    <div className="card w-full p-6 sm:p-8">
      <h2 className="font-display text-2xl font-bold">{mode === "up" ? x.upT : x.inT}</h2>
      <p className="mt-1 text-sm text-ink-soft">{mode === "up" ? x.upS : x.inS}</p>

      <button type="button" disabled={busy} onClick={() => void run(signInGoogle)} className="btn btn-outline mt-6 w-full">
        <GoogleIcon /> {x.google}
      </button>
      <button type="button" disabled={busy || Boolean(tgUrl)} onClick={() => void tgLogin()} className="btn btn-outline mt-3 w-full">
        <Send className="h-5 w-5 text-[#229ED9]" aria-hidden="true" /> {tx.btn}
      </button>
      {inApp && !tgUrl && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-xs text-ink-soft">{tx.inApp}</p>}
      {tgUrl && (
        <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm" role="status">
          <p className="flex items-start gap-2"><Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" aria-hidden="true" /> {tx.wait}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
            <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">{tx.open}</a>
            <button type="button" onClick={stopTg} className="text-ink-soft hover:underline">{tx.cancel}</button>
          </p>
        </div>
      )}

      <div className="my-5 flex items-center gap-3 text-xs text-ink-soft" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200 dark:bg-[#34312D]" /> {x.or} <span className="h-px flex-1 bg-slate-200 dark:bg-[#34312D]" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "up" && (
          <label className="block text-sm font-semibold">{x.name}
            <input className="field mt-1.5 font-normal" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
        )}
        <label className="block text-sm font-semibold">{x.email}
          <input className="field mt-1.5 font-normal" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="block text-sm font-semibold">
          <span className="flex items-center justify-between">{x.pass}
            {mode === "in" && <button type="button" onClick={() => void forgot()} className="text-xs font-semibold text-brand hover:underline">{x.forgot}</button>}
          </span>
          <input className="field mt-1.5 font-normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "up" ? x.passHint : undefined} autoComplete={mode === "up" ? "new-password" : "current-password"} minLength={6} required />
        </label>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {info && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{info}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} {x.go}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {mode === "up" ? x.haveAcc : x.noAcc}{" "}
        <Link href={mode === "up" ? "/sign-in" : "/sign-up"} className="font-semibold text-brand hover:underline">{mode === "up" ? x.toIn : x.toUp}</Link>
      </p>
    </div>
  );
}
