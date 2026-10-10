import SubscriberLinks from "@/components/SubscriberLinks";

const FAQ = [
  {
    q: "מה זו ועדת השגות על שומות רמ\"י?",
    a: "כשרשות מקרקעי ישראל קובעת שווי לצורך דמי חכירה מהוונים, היתר או הקצאה, ניתן להשיג על השומה. ועדת השגות דנה במחלוקת בין השמאי המחוזי לשמאי מטעם המשיג, והחלטותיה מתפרסמות במאגר ציבורי.",
  },
  {
    q: "איך בודקים אם כדאי להשיג על שומת רמ\"י?",
    a: "בדיקה ראשונית מאתרת החלטות של ועדת השגות ביישוב הרלוונטי, ובודקת אם יש תקדימים או סוגיות דומות שעשויות להצדיק בדיקה מקצועית מלאה של השומה, לפני שמחליטים אם להמשיך.",
  },
  {
    q: "כמה עולה בדיקה מקדימה?",
    a: "480 ₪, מחיר קבוע. המחיר מוצג לפני התשלום.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const SERVICE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "בדיקת סבירות ראשונית להשגה על שומת רשות מקרקעי ישראל",
  provider: {
    "@type": "Person",
    name: "חיים אטקין",
    jobTitle: "שמאי מקרקעין",
  },
  areaServed: { "@type": "Country", name: "IL" },
  offers: {
    "@type": "Offer",
    priceCurrency: "ILS",
    price: "480",
  },
};

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <section className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d5c] leading-snug mb-3">
          קיבלת שומה מרשות מקרקעי ישראל?
          <br />
          בדוק לפני שאתה משלם או מגיש השגה.
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
          המערכת מאתרת עבורך החלטות של ועדת השגות שעשויות להיות רלוונטיות ביישוב שלך ובסוגיות
          שנדונו, ומראה מה נקבע בפועל במקרים דומים. בדיקה ראשונית שמרכזת עבורך את ההחלטות
          הרלוונטיות ומבארת אותן בשפה פשוטה וברורה, במקום חיפוש עצמאי בעשרות רבות של מסמכים
          ארוכים ומסובכים במאגר הממשלתי.
        </p>
        <p className="text-xs text-gray-500 max-w-xl mx-auto mt-3 leading-relaxed">
          חשוב לדעת: הבדיקה הראשונית אינה שומה נגדית ואינה קובעת שהשומה שגויה. היא מרכזת החלטות
          וסוגיות שעשויות להצדיק בדיקה מלאה של השומה שקיבלת.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/rami/check/"
            className="inline-block bg-[#1a4d5c] hover:bg-[#123640] text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            בדוק את היישוב שלך, 480 ₪
          </a>
          <a
            href="/rami/sample-report.html"
            target="_blank"
            className="inline-block border-2 border-[#1a4d5c] text-[#1a4d5c] hover:bg-[#eaf2f3] font-bold px-6 py-3 rounded-lg transition-colors"
          >
            צפה בדוגמת דוח
          </a>
        </div>
        <a
          href="/rami/upgrade/"
          className="block mt-4 bg-[#eaf2f3] border border-[#b9d3d8] rounded-xl px-5 py-3 text-sm text-[#123640] hover:bg-[#dcebed] transition-colors max-w-md mx-auto"
        >
          כבר יש לך שומה ומכתב דרישה מרמ&quot;י ביד? <strong>רוצה לדלג ישר לבדיקה המלאה?</strong>
        </a>
        <p className="text-sm text-gray-600 mt-5 mb-0">בודקים הרבה? עורכי דין, שמאים ומשרדים עובדים עם מנוי שנתי:</p>
        <SubscriberLinks variant="hero" />
      </section>

      <section className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { title: "1. בוחר יישוב", body: "מזין את היישוב שבו נמצא הנכס שקיבלת עליו שומה" },
          { title: "2. מקבל תמונת מצב", body: "דוח ברור שמציג החלטות רלוונטיות, טענות שהתקבלו או נדחו, ונקודות שכדאי לבדוק" },
          { title: "3. מחליט אם להמשיך", body: "רואה אם יש אינדיקציה שמצדיקה בדיקה מלאה של השומה" },
        ].map((s) => (
          <div key={s.title} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="font-bold text-[#1a4d5c] mb-1">{s.title}</div>
            <div className="text-sm text-gray-600">{s.body}</div>
          </div>
        ))}
      </section>

      <section className="bg-[#eaf2f3] border border-[#b9d3d8] rounded-xl p-5 mb-10">
        <div className="font-bold text-[#123640] mb-2">מה בעצם מקבלים?</div>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc pr-5">
          <li>החלטות ועדת השגות רלוונטיות מהיישוב שלך</li>
          <li>לכל החלטה: מה טענה הרשות, מה טען המשיג, ומה נקבע בפועל</li>
          <li>קישור למסמך המקורי במאגר הממשלתי, לבקרה שלך</li>
          <li>אפשרות להמשך לבדיקה מקצועית של השומה, להכנת מסמך עיקרי דברים ולשיחת ייעוץ אישית עם חיים אטקין</li>
        </ul>
      </section>

      <section className="mb-10">
        <div className="font-bold text-[#123640] mb-3 text-center">למי השירות מתאים?</div>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc pr-5 max-w-xl mx-auto">
          <li><strong>בעלי נכסים והציבור הרחב:</strong> קיבלת שומה מרמ&quot;י? האם יש הצדקה לבדוק לפני שממשיכים</li>
          <li><strong>עורכי דין:</strong> איתור מהיר של החלטות וטענות רלוונטיות</li>
          <li><strong>שמאי מקרקעין:</strong> כלי מחקר וסינון החלטות לפי יישוב וסוגיה</li>
          <li><strong>יזמים ובעלי מקרקעין:</strong> בדיקת חשיפה לפני עסקה מול רמ&quot;י, על סמך החלטות דומות</li>
        </ul>
        <p className="text-xs text-gray-400 text-center max-w-xl mx-auto mt-3">
          הבדיקה אינה מחליפה שומה, ייעוץ משפטי או בדיקה מקצועית מלאה.
        </p>
      </section>

      <section className="text-center text-sm text-gray-500 mb-10">
        <p>
          המועדים להשגה על שומת רמ&quot;י קצרים, והם כתובים בהודעה שקיבלת שצורפה לשומה. אל תמתין
          לסוף התקופה.
        </p>
      </section>

      <section>
        <h2 className="font-bold text-[#123640] mb-3 text-center">שאלות נפוצות</h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <summary className="font-medium text-[#123640] cursor-pointer">{item.q}</summary>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
