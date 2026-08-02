"use client";

import { useState } from "react";
import { supabase, supabaseConfigured, PRICE_NIS } from "@/lib/supabase";

const CARDCOM_LINK = process.env.NEXT_PUBLIC_CARDCOM_LINK_TIER1;

type Lookup =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "not_found" }
  | { state: "found"; yishuv: string; count: number; classified: boolean };

export default function CheckPage() {
  const [yishuvInput, setYishuvInput] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ state: "idle" });
  const [block, setBlock] = useState("");
  const [plot, setPlot] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!yishuvInput.trim() || !block.trim() || !plot.trim()) {
      setError("נא להזין יישוב, גוש וחלקה");
      return;
    }
    setLookup({ state: "loading" });
    setError(null);

    if (!supabaseConfigured) {
      setError("המערכת עדיין לא מחוברת למאגר הנתונים. נסו שוב מאוחר יותר.");
      setLookup({ state: "idle" });
      return;
    }

    const { data, error: qError } = await supabase
      .from("rami_yishuvim")
      .select("name, decisions_count, classified")
      .ilike("name", `%${yishuvInput.trim()}%`)
      .limit(1)
      .maybeSingle();

    if (qError || !data) {
      setLookup({ state: "not_found" });
      return;
    }

    setLookup({ state: "found", yishuv: data.name, count: data.decisions_count, classified: data.classified });
  }

  async function handlePay() {
    if (lookup.state !== "found") return;
    if (!contactPhone.trim() && !contactEmail.trim()) {
      setError("נא להזין טלפון או אימייל לקבלת הדוח");
      return;
    }
    if (!CARDCOM_LINK) {
      setError("התשלום המקוון עדיין לא מוגדר. אנא צרו קשר בוואטסאפ.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("rami_cases")
        .insert({
          yishuv_name: lookup.yishuv,
          block: block.trim(),
          plot: plot.trim(),
          contact_name: contactName || null,
          contact_phone: contactPhone || null,
          contact_email: contactEmail || null,
          price_nis: PRICE_NIS,
          paid: false,
          status: "pending_payment",
        })
        .select("id")
        .single();

      if (insertError || !data) throw insertError ?? new Error("insert failed");

      const siteUrl = "https://haimetkin-lgtm.github.io/rami";
      const url = new URL(CARDCOM_LINK);
      url.searchParams.set("SuccessRedirectUrl", `${siteUrl}/report/?case=${data.id}`);
      url.searchParams.set("FailedRedirectUrl", `${siteUrl}/check/?payment=failed`);
      window.location.href = url.toString();
    } catch {
      setError("אירעה שגיאה. נסו שוב, או צרו קשר בוואטסאפ.");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-[#123640] mb-1">בדיקת סבירות ראשונית להשגה על שומת רמ&quot;י</h1>
      <p className="text-sm text-gray-500 mb-6">שלב 1: מזינים את היישוב, גוש וחלקה של הנכס</p>

      <form onSubmit={handleLookup} className="space-y-2 mb-4">
        <input
          type="text"
          value={yishuvInput}
          onChange={(e) => setYishuvInput(e.target.value)}
          placeholder="יישוב, למשל: אשדוד, כפר סבא, מודיעין..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a4d5c]"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="גוש"
            required
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="חלקה"
            required
            value={plot}
            onChange={(e) => setPlot(e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#1a4d5c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#123640] cursor-pointer"
        >
          חיפוש
        </button>
      </form>

      {lookup.state === "loading" && <p className="text-sm text-gray-500">מחפש...</p>}
      {lookup.state === "not_found" && (
        <p className="text-sm text-[#8a2f22]">לא מצאנו יישוב בשם הזה. נסו לבדוק את האיות, או צרו קשר בוואטסאפ.</p>
      )}
      {lookup.state !== "found" && error && <p className="text-sm text-[#8a2f22]">{error}</p>}

      {lookup.state === "found" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">יישוב</div>
          <div className="font-bold text-[#123640] mb-3">{lookup.yishuv}</div>
          <div className="bg-[#eaf2f3] rounded-lg px-3 py-2 text-sm text-[#123640] mb-4">
            נמצאו <strong>{lookup.count.toLocaleString("he-IL")}</strong> החלטות ועדת השגות במאגר עבור יישוב זה.
          </div>
          <div className="text-2xl font-bold text-[#1a4d5c] mb-4">{PRICE_NIS.toLocaleString("he-IL")} ₪</div>

          <div className="space-y-2 mb-4">
            <input
              type="text"
              placeholder="שם מלא"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="tel"
              placeholder="טלפון"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              dir="ltr"
            />
            <input
              type="email"
              placeholder="אימייל"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              dir="ltr"
            />
          </div>

          {!lookup.classified && (
            <p className="text-xs text-gray-500 mb-3">
              היישוב הזה טרם סווג במלואו, הדוח שלכם יופק תוך זמן קצר וישלח אליכם, ולא יוצג באופן מיידי.
            </p>
          )}

          {error && <p className="text-sm text-[#8a2f22] mb-3">{error}</p>}

          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full bg-[#1a4d5c] text-white font-bold py-3 rounded-lg hover:bg-[#123640] disabled:opacity-50 cursor-pointer disabled:cursor-default"
          >
            {submitting ? "מעביר לתשלום..." : `המשך לתשלום · ${PRICE_NIS} ₪`}
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <a
          href={`https://wa.me/972523728828?text=${encodeURIComponent("שלום חיים, יש לי שאלה לפני שאני מתחיל בדיקה")}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-[#25d366] text-white text-sm font-medium px-4 py-2 rounded-full"
        >
          יש שאלה? וואטסאפ לחיים אטקין
        </a>
      </div>
    </main>
  );
}
