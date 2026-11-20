import Link from 'next/link';

export default function AboutPage() {
  return (
    <main dir="rtl" className="mada-page min-h-screen bg-transparent">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">عن مدى العالم</h1>
          <p className="mt-3 text-sm text-gray-500">منصة عربية تنشر مواد تحريرية أصلية وتوضح مصادر المعلومات.</p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900">من نحن؟</h2>
              <p className="mt-3 leading-8">
                مدى العالم منصة صحفية عربية تديرها هيئة تحرير مدى العالم، وتنشر تقارير ومواد أصلية بعد التحقق من المعلومات والمراجع المتاحة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">كيف نعدّ المواد؟</h2>
              <p className="mt-3 leading-8">
                ننشر على الموقع مواد أعدّها فريق التحرير، ولا نعرض موجزات أو نسخًا آلية من أخبار الناشرين الخارجيين. عندما تستند مادة إلى مصدر خارجي، نذكره ونربط به لتمكين القارئ من التحقق.
              </p>
              <p className="mt-3 leading-8">
                نميّز المواد التي أعدتها هيئة التحرير بعبارة «خاص مدى العالم»، ونوضح مصادرها في صفحة المادة. تفاصيل المراجعة والنشر موضحة في{' '}
                <Link href="/editorial-policy" className="font-semibold text-blue-700 underline">السياسة التحريرية</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">خدمات الموقع</h2>
              <ul className="mt-3 list-disc space-y-2 pr-6 leading-8">
                <li>قراءة التقارير والمواد التحريرية التي أعدّها فريق مدى العالم.</li>
                <li>الاطلاع على المراجع التي تستند إليها المواد المنشورة.</li>
                <li>إرسال التصحيحات والاستفسارات التحريرية إلى فريق الموقع.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">الملكية والتواصل</h2>
              <p className="mt-3 leading-8">
                تبقى المواد والصور والعلامات التجارية الخاصة بأصحابها. لطلب تصحيح أو الإبلاغ عن مادة أو مسألة حقوق نشر، تواصل معنا عبر صفحة{' '}
                <Link href="/contact" className="font-semibold text-blue-700 underline">التواصل</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
