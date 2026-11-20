import Link from 'next/link';

export default function AboutPage() {
  return (
    <main dir="rtl" className="mada-page min-h-screen bg-transparent">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">عن مدى العالم</h1>
          <p className="mt-3 text-sm text-gray-500">منصة عربية لاكتشاف الأخبار من مصادرها ومتابعة المواد التحريرية الخاصة بنا.</p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900">من نحن؟</h2>
              <p className="mt-3 leading-8">
                مدى العالم منصة إخبارية عربية تديرها هيئة تحرير مدى العالم. نساعد القراء على متابعة الأخبار حسب القسم والناشر، وننشر مواد تحريرية خاصة بنا عندما تتوفر لها مصادر ومعلومات كافية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">كيف نعرض الأخبار؟</h2>
              <p className="mt-3 leading-8">
                الأخبار الواردة من الناشرين الخارجيين تظهر بعنوانها واسم مصدرها ووقت نشرها ورابط مباشر إلى موقع الناشر. لا نعرض نص المقال الخارجي كاملًا على موقعنا؛ وللتفاصيل يرجى زيارة المصدر الأصلي.
              </p>
              <p className="mt-3 leading-8">
                نميّز المواد التي أعدتها هيئة التحرير بعبارة «خاص مدى العالم»، ونوضح مصادرها في صفحة المادة. تفاصيل المراجعة والنشر موضحة في{' '}
                <Link href="/editorial-policy" className="font-semibold text-blue-700 underline">السياسة التحريرية</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">خدمات الموقع</h2>
              <ul className="mt-3 list-disc space-y-2 pr-6 leading-8">
                <li>تصفح الأخبار حسب القسم ومصدر النشر.</li>
                <li>الانتقال مباشرة إلى صفحة الخبر لدى الناشر.</li>
                <li>حفظ الأخبار في المفضلة ومتابعة المصادر عند تسجيل الدخول.</li>
                <li>قراءة المواد التحريرية الخاصة بمدى العالم ومصادرها.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">الملكية والتواصل</h2>
              <p className="mt-3 leading-8">
                تبقى المقالات والصور والعلامات التجارية الخاصة بالناشرين الخارجيين ملكًا لأصحابها. لطلب تصحيح أو الإبلاغ عن مادة أو حقوق نشر، تواصل معنا عبر صفحة{' '}
                <Link href="/contact" className="font-semibold text-blue-700 underline">التواصل</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
