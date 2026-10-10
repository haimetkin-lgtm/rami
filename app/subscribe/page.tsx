"use client";

import { useEffect, useState } from "react";
import {
  fetchPlans, startSubscriptionCheckout, useSession, rememberNext,
  type Billing, type PlanKey, type PlanProducts, type PublicPlan,
} from "@/lib/subscriptions";

const BASE = "/rami";
const WA = "972523728828";
const fmt = (n: number) => n.toLocaleString("he-IL");

// התאמות תצוגה לאתר (הטקסטים מהשרת משותפים לשני האתרים)
const DEFAULT_PRODUCTS: PlanProducts = "rami";
const displayName = (p: PublicPlan) => (p.key === "appraiser" ? "מנוי לשמאי מחוזי" : p.name);
const displayAudience = (p: PublicPlan) =>
  p.key === "appraiser" ? "שמאי מחוזי" : p.key === "org" ? "ועדה מחוזית, עירייה, גוף גדול" : p.audience;

// ברמ"י ההחלטות ממוינות לפי יישובים ולא לפי ועדות
const YISHUVIM: [string, string][] = [
  ["בוועדות שבחרתם", "ביישובים שבחרתם"],
  ["לוועדה או ליישוב שחסר", "ליישוב שחסר"],
  ["בעד 15 ועדות", "בעד 15 יישובים"],
  ["סוגיה, ועדה ושמאי", "סוגיה, יישוב ושמאי"],
  ["בכל הוועדות", "בכל היישובים"],
];
const displayFeature = (f: string) => YISHUVIM.reduce((t, [a, b]) => t.split(a).join(b), f);

const ERRORS: Record<string, string> = {
  already_subscribed: "כבר יש לכם מנוי פעיל מהסוג הזה. ניתן לראות אותו באזור האישי.",
  email_not_confirmed: "כתובת האימייל עדיין לא אומתה. אמתו אותה דרך המייל שנשלח אליכם ונסו שוב.",
  plan_not_available: "החבילה הזו עדיין לא זמינה לרכישה.",
  login_required: "יש להתחבר מחדש.",
};

function Check({ light }: { light?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" className="shrink-0 mt-0.5" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" fill="none" stroke={light ? "#6ee7a0" : "#2e8b57"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Pill<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="inline-flex bg-white rounded-full border border-gray-200 shadow-sm p-1 text-sm">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-4 py-1.5 rounded-full cursor-pointer transition-colors ${value === v ? "bg-[#1a4d5c] text-white font-medium" : "text-gray-600 hover:text-gray-900"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function SubscribePage() {
  const { session, loading } = useSession();
  const [plans, setPlans] = useState<PublicPlan[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [products, setProducts] = useState<PlanProducts>(DEFAULT_PRODUCTS);
  const [billing, setBilling] = useState<Billing>("full");
  const [busyPlan, setBusyPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);

  useEffect(() => {
    fetchPlans().then(setPlans).catch(() => setLoadError(true));
    setPaymentFailed(new URLSearchParams(window.location.search).get("payment") === "failed");
  }, []);

  async function buy(plan: PlanKey) {
    setError(null);
    if (!session) {
      rememberNext("/subscribe/");
      window.location.href = `${BASE}/login/`;
      return;
    }
    setBusyPlan(plan);
    try {
      window.location.href = await startSubscriptionCheckout(session.access_token, plan, products, billing);
    } catch (e) {
      setError(ERRORS[(e as Error).message] ?? "לא הצלחנו לפתוח את דף התשלום. נסו שוב, או צרו קשר בוואטסאפ.");
      setBusyPlan(null);
    }
  }

  const mail = (subject: string) => `mailto:haimetkin@gmail.com?subject=${encodeURIComponent(subject)}`;
  const wa = (text: string) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#123640] mb-2">מנויים שנתיים</h1>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          בדיקות מקדימות בכמות, על חשבון המנוי, בלי לשלם על כל בדיקה בנפרד. המנוי שנתי וללא חידוש אוטומטי.
        </p>
        <p className="text-xs text-gray-400 mt-1">כל המחירים באתר זה כוללים מע״מ.</p>
      </div>

      {paymentFailed && (
        <p className="text-sm text-[#8a2f22] bg-[#fbeeea] rounded-lg px-3 py-2 mt-4 text-center">התשלום לא הושלם ולא חויבתם. אפשר לנסות שוב.</p>
      )}

      <div className="flex flex-col items-center gap-3 mt-6 mb-8">
        <Pill
          value={billing}
          onChange={setBilling}
          options={[["full", "שנתי (כ-10% הנחה)"], ["installments", "12 תשלומים"]]}
        />
        <Pill
          value={products}
          onChange={setProducts}
          options={[["machria", "היטל השבחה"], ["rami", 'רמ"י'], ["both", "שני האתרים (+40%)"]]}
        />
      </div>

      {loadError && <p className="text-sm text-[#8a2f22] text-center">לא הצלחנו לטעון את החבילות. נסו לרענן, או צרו קשר בוואטסאפ.</p>}
      {!plans && !loadError && <p className="text-sm text-gray-500 text-center">טוען חבילות...</p>}
      {error && <p className="text-sm text-[#8a2f22] bg-[#fbeeea] rounded-lg px-3 py-2 mb-4 text-center">{error}</p>}
      {session && !loading && <p className="text-xs text-gray-500 mb-4 text-center">מחוברים כ-{session.user.email}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {plans?.map((p) => {
          const price = p.prices[products];
          const dark = p.availability === "quote";
          const showFull = billing === "full" && price.fullYearNis > 0;
          return (
            <div
              key={p.key}
              className={`flex flex-col rounded-2xl p-5 shadow-sm border ${
                dark ? "bg-[#123640] text-white border-[#123640]" : "bg-white border-gray-200"
              }`}
            >
              <h2 className={`font-bold text-lg ${dark ? "text-white" : "text-[#123640]"}`}>{displayName(p)}</h2>
              <p className={`text-xs mt-1 mb-4 min-h-[2.5rem] ${dark ? "text-gray-300" : "text-gray-500"}`}>{displayAudience(p)}</p>

              {p.availability === "available" && (
                <div className="mb-4">
                  {showFull ? (
                    <>
                      <div className="text-3xl font-bold text-[#1a4d5c]">
                        {fmt(price.fullYearNis)} ₪ <span className="text-base font-medium text-gray-500">/ שנה</span>
                      </div>
                      <div className="text-sm text-gray-400 line-through">{fmt(price.installmentsYearNis)} ₪ / שנה</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-[#1a4d5c]">
                        {fmt(price.installmentsMonthlyNis)} ₪ <span className="text-base font-medium text-gray-500">/ חודש</span>
                      </div>
                      <div className="text-sm text-gray-500">12 תשלומים, {fmt(price.installmentsYearNis)} ₪ לשנה</div>
                    </>
                  )}
                </div>
              )}
              {dark && <div className="mb-4 text-2xl font-bold">הצעת מחיר מותאמת</div>}

              <ul className="space-y-2 mb-6 text-sm flex-1">
                {p.features.map((f) => displayFeature(f)).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check light={dark} />
                    <span className={dark ? "text-gray-100" : "text-gray-700"}>{f}</span>
                  </li>
                ))}
              </ul>

              {p.availability === "available" && (
                <button
                  onClick={() => buy(p.key)}
                  disabled={busyPlan !== null}
                  className="w-full bg-[#1a4d5c] text-white font-bold py-3 rounded-xl hover:bg-[#123640] disabled:opacity-50 cursor-pointer disabled:cursor-default transition-colors"
                >
                  {busyPlan === p.key ? "מעביר לתשלום..." : session ? "לרכישה" : "הרשמה ורכישה"}
                </button>
              )}
              {p.availability === "coming_soon" && (
                <a
                  href={mail(`רשימת המתנה: ${displayName(p)}`)}
                  className="block text-center border border-[#1a4d5c] text-[#1a4d5c] font-bold py-3 rounded-xl hover:bg-[#eaf2f3]"
                >
                  הצטרפות לרשימת המתנה
                </a>
              )}
              {p.availability === "quote" && (
                <a
                  href={wa("שלום חיים, אני מעוניין בהצעת מחיר למנוי לוועדה או לארגון")}
                  target="_blank"
                  className="block text-center bg-white text-[#123640] font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  בקשת הצעת מחיר
                </a>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-8 leading-relaxed text-center max-w-2xl mx-auto">
        הבדיקות המקדימות ועיקרי הדברים נפתחים מיד באזור האישי. ההתראות במייל מופעלות בהדרגה, ועד אז ניתנות לפי פנייה אל חיים. הבדיקה היא ראשונית, ואינה שומה ואינה ייעוץ משפטי.
      </p>
      <p className="text-sm text-gray-500 mt-4 text-center">
        כבר מנויים? <a href={`${BASE}/login/`} className="text-[#1a4d5c] underline">כניסה לאזור האישי</a>
      </p>
    </main>
  );
}
