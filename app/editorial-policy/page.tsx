import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';

export const metadata: Metadata = {
  title: 'السياسة التحريرية',
  description: 'تعرف على آلية إعداد ومراجعة المواد التحريرية في مدى العالم، ومصادرها، وكيفية إرسال التصحيحات.',
  alternates: { canonical: `${siteUrl.replace(/\/$/, '')}/editorial-policy` },
  robots: { index: true, follow: true },
};

export default function EditorialPolicyPage() {
  return (
    <main dir="rtl" className="mada-page min-h-screen bg-transparent">
      <article className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
          <header>
            <p className="text-sm font-bold text-blue-700">مدى العالم</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">السياسة التحريرية ومصادر المعلومات</h1>
            <p className="mt-3 leading-8 text-slate-600">توضح هذه الصفحة الجهة المسؤولة عن المحتوى وكيفية التعامل مع الأخبار والتصحيحات.</p>
          </header>

          <div className="mt-8 space-y-8 leading-8 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-950">المسؤولية التحريرية</h2>
              <p className="mt-3">الجهة الناشرة والمسؤولة عن المواد التي تحمل عبارة «خاص مدى العالم» هي هيئة تحرير مدى العالم. لا ننسب المادة إلى كاتب فردي ما لم يظهر اسمه صراحة في صفحة المادة.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">استخدام المصادر</h2>
              <p className="mt-3">لا ننشر موجزات RSS أو عناوين الأخبار الخارجية كخلاصات أو صفحات أخبار على الموقع. عندما تستند مادة تحريرية إلى معلومات من جهة أخرى، يراجع المحرر المصدر ويذكره ويربط بصفحته لتمكين القارئ من التحقق.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">المواد الخاصة ومراجعتها</h2>
              <p className="mt-3">قد تُستخدم أدوات آلية لإعداد مسودات أولية اعتمادًا على معلومات منشورة. تبقى المسودة غير منشورة وغير متاحة للفهرسة حتى يراجعها محرر بشري، ويتحقق من الوقائع والمصادر والروابط، ويقرر صلاحيتها للنشر. تُعرض مصادر المادة في صفحتها متى كانت متاحة.</p>
              <p className="mt-3">نحذف أو نصحح المادة عند اكتشاف خطأ جوهري، ونحدّث تاريخ التعديل عندما يتغير المحتوى تغيّرًا تحريريًا ذا شأن.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">التصحيحات وحقوق النشر</h2>
              <p className="mt-3">لإبلاغنا عن خطأ أو طلب تصحيح أو مسألة تتعلق بحقوق النشر، أرسل رابط الصفحة وتفاصيل الطلب إلى{' '}
                <a href="mailto:contact@madaalalam.com?subject=Editorial%20correction%20or%20rights%20report" className="font-semibold text-blue-700 underline">contact@madaalalam.com</a>.
              </p>
              <p className="mt-3">نميّز بين المادة التي أعدّها فريق مدى العالم والمراجع الخارجية التي استندت إليها. لا تعني الإحالة إلى مصدر تبنّي كل ما ورد فيه من آراء.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">بيانات الناشر</h2>
              <p className="mt-3">الناشر: مدى العالم. التواصل التحريري: <a href="mailto:contact@madaalalam.com" className="font-semibold text-blue-700 underline">contact@madaalalam.com</a>.</p>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
