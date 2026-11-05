import { Camera, TrendingUp, User } from "lucide-react";

const ROLES = [
  { icon: Camera, tint: "bg-peach", title: "Mobilograflar", text: "Portfolio yuklaydi, xizmatlarini narx bilan joylaydi va mijozlardan buyurtma oladi." },
  { icon: TrendingUp, tint: "bg-sky", title: "SMM mutaxassislari", text: "Strategiya, kontent-reja va reklama xizmatlarini taqdim etadi, ishlarini portfolioda ko‘rsatadi." },
  { icon: User, tint: "bg-mint", title: "Mijozlar", text: "Mutaxassislarni qidiradi, portfoliolarni ko‘radi va kerakli xizmatga buyurtma beradi." },
];

const STEPS = [
  { title: "Ro‘yxatdan o‘ting", text: "Rolingizni tanlang: mobilograf, SMM mutaxassisi yoki mijoz." },
  { title: "Toping yoki joylang", text: "Mijozlar katalogdan qidiradi, mutaxassislar portfolio va xizmatlarini joylaydi." },
  { title: "Buyurtma bering", text: "Xizmatni tanlang, vazifani yozing va buyurtmani sayt ichida yuboring." },
  { title: "Natijani oling", text: "Buyurtma holatini kuzating va tayyor ishni qabul qiling." },
];

const SERVICES = {
  "Mobilograf xizmatlari": ["Reels va Shorts suratga olish", "Video montaj", "Foto va video sessiya", "Biznes uchun kontent kuni", "Mahsulot va taom suratga olish", "Drone bilan suratga olish"],
  "SMM xizmatlari": ["Kontent-reja va strategiya", "Instagram sahifasini yuritish", "Telegram kanalini yuritish", "Target reklama", "Matn va caption yozish", "Sahifa dizayni va highlights"],
};

export function PlatformSection() {
  return (
    <section id="platforma" className="scroll-mt-16 bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold text-brand">Platforma haqida</p>
        <h2 className="mt-2 max-w-lg text-3xl font-bold">Kontent bilan ishlaydigan uch tomon, bitta platforma</h2>
        <p className="mt-3 max-w-xl text-sm text-ink-soft">Creator Hub biznes egalarini mobilograflar va SMM mutaxassislari bilan bog‘laydi. Har bir tomon o‘z vazifasiga mos imkoniyatlar oladi.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ROLES.map(({ icon: Icon, tint, title, text }) => (
            <div key={title} className="rounded-xl2 bg-surface p-5">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}><Icon className="h-4 w-4" /></span>
              <h3 className="mt-4 text-sm font-bold">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="qanday" className="scroll-mt-16 bg-surface py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold text-brand">Qanday ishlaydi</p>
        <h2 className="mt-2 max-w-lg text-3xl font-bold">To‘rt qadamda buyurtmadan natijagacha</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 text-sm font-bold">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section id="xizmatlar" className="scroll-mt-16 bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold text-brand">Xizmatlar</p>
        <h2 className="mt-2 max-w-lg text-3xl font-bold">Qanday xizmatlarga buyurtma berish mumkin</h2>
        <p className="mt-3 max-w-xl text-sm text-ink-soft">Har bir mutaxassis o‘z xizmatlarini alohida karta sifatida narx yoki “Kelishiladi” belgisi bilan joylaydi.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {Object.entries(SERVICES).map(([title, items]) => (
            <div key={title} className="rounded-xl2 bg-surface p-5">
              <h3 className="text-sm font-bold">{title}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {items.map((i) => (
                  <li key={i} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs">{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
