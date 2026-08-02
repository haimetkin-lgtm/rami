"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, supabaseConfigured, CaseRow, STAGE2_PRICE_NIS } from "@/lib/supabase";

const CARDCOM_STAGE2_LINK = process.env.NEXT_PUBLIC_CARDCOM_LINK_STAGE2;
const SITE_URL = "https://haimetkin-lgtm.github.io/rami";

function UpgradeContent() {
  const params = useSearchParams();
  const caseId = params.get("case");
  const paymentFailed = params.get("payment") === "failed";
  const [caseRow, setCaseRow] = useState<CaseRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId || !supabaseConfigured) return;
    supabase
      .from("rami_cases")
      .select("*")
      .eq("id", caseId)
      .single()
      .then(({ data }) => setCaseRow((data as CaseRow) || null));
  }, [caseId]);

  async function handlePay() {
    if (!supabaseConfigured) {
      setError("המערכת עדיין לא מחוברת. נסו שוב מאוחר יותר.");
      return;
    }
    if (!CARDCOM_STAGE2_LINK) {
      setError("התשלום עדיין לא מוגדר. אנא צרו קשר בוואטסאפ.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("rami_stage2_cases")
        .insert({
          stage1_case_id: caseId || null,
          yishuv_name: caseRow?.yishuv_name || "",
          contact_name: caseRow?.contact_name || null,
          contact_phone: caseRow?.contact_phone || null,
          contact_email: caseRow?.contact_email || null,
          price_nis: STAGE2_PRICE_NIS,
          paid: false,
          status: "pending_payment",
        })
        .select("id")
        .single();
      if (insertError || !data) throw insertError ?? new Error("insert failed");

      const url = new URL(CARDCOM_STAGE2_LINK);
      url.searchParams.set("SuccessRedirectUrl", `${SITE_URL}/upload/?case2=${data.id}`);
      url.searchParams.set("FailedRedirectUrl", `${SITE_URL}/upgrade/?case=${caseId || ""}&payment=failed`);
      window.location.href = url.toString();
    } catch {
      setError("אירעה שגיאה. נסו שוב, או צרו קשר בוואטסאפ.");
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-[#123640] mb-3">
        עיקרי דברים ביד, לדיון מול ועדת ההשגות
      </h1>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        מעלים את השומה מרמ&quot;י ואת מכתב הדרישה מרמ&quot;י, והמערכת מכינה עבורכם מסמך עיקרי טיעון מבוסס על ההחלטות
        הרלוונטיות שנמצאו. התשלום כולל גם שיחת ייעוץ מקוונת עם חיים אטקין על המסמך, ללא תוספת מחיר.
      </p>
      {caseRow?.yishuv_name && (
        <div className="bg-[#eaf2f3] rounded-lg px-3 py-2 text-sm text-[#123640] mb-4">
          יישוב: <strong>{caseRow.yishuv_name}</strong>
        </div>
      )}
      {paymentFailed && (
        <p className="text-sm text-[#8a2f22] mb-4">התשלום לא הושלם. אפשר לנסות שוב.</p>
      )}
      {error && <p className="text-sm text-[#8a2f22] mb-4">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePay}
          disabled={submitting}
          className="flex-1 bg-[#1a4d5c] text-white font-bold py-3 rounded-lg hover:bg-[#123640] disabled:opacity-50 cursor-pointer disabled:cursor-default"
        >
          {submitting ? "מעביר לתשלום..." : `המשך לתשלום · ${STAGE2_PRICE_NIS.toLocaleString("he-IL")} ₪`}
        </button>
        <a
          href="/rami/sample-argument.html"
          target="_blank"
          className="flex-1 inline-flex items-center justify-center border-2 border-[#1a4d5c] text-[#1a4d5c] hover:bg-[#eaf2f3] font-bold py-3 rounded-lg transition-colors text-center"
        >
          צפה בדוגמת מסמך עיקרי דברים
        </a>
      </div>
      <div className="mt-6 text-center">
        <a
          href={`https://wa.me/972523728828?text=${encodeURIComponent("שלום חיים, יש לי שאלה לפני שאני ממשיך לשלב הבא")}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-[#25d366] text-white text-sm font-medium px-4 py-2 rounded-full"
        >
          יש שאלה? וואטסאפ לחיים אטקין
        </a>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <Suspense fallback={<p className="text-gray-500">טוען...</p>}>
        <UpgradeContent />
      </Suspense>
    </main>
  );
}
