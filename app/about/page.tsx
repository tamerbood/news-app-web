export default function AboutPage() {
  return (
    <main dir="rtl" className="mada-page min-h-screen bg-transparent">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">عن مدى العالم</h1>
          <p className="mt-3 text-sm text-gray-500">وجهتك لمتابعة أحدث الأخبار في مكان واحد.</p>
          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900">ما هي مدى العالم؟</h2>
              <p className="mt-3 leading-7">مدى العالم منصة إخبارية تجمع الأخبار من مصادر متعددة وتساعد المستخدمين على اكتشاف أحدث الأخبار في مكان واحد.</p>
              <p className="mt-3 leading-7">تنظم المنصة الأخبار حسب التصنيفات والمصادر، وتوفر ميزات التصفح والبحث وحفظ المفضلة ومتابعة المصادر وغيرها من الخدمات المتاحة.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900">ماذا يمكنك أن تفعل؟</h2>
              <ul className="mt-3 list-disc space-y-2 pr-6">
                <li>تصفح أحدث الأخبار.</li><li>البحث عن الأخبار بالكلمات المفتاحية.</li><li>تصفح الأخبار حسب التصنيف أو المصدر.</li><li>الانتقال إلى المصدر الأصلي للخبر.</li><li>حفظ الأخبار في المفضلة.</li><li>متابعة مصادر الأخبار.</li><li>استقبال الإشعارات المتاحة.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900">مصادر الأخبار</h2>
              <p className="mt-3 leading-7">تعتمد مدى العالم على معلومات الأخبار ومصادر RSS التابعة لناشرين ومؤسسات إخبارية خارجية.</p>
              <p className="mt-3 leading-7">نضع روابط للمصادر الأصلية متى كانت متاحة حتى يتمكن المستخدم من الوصول إلى المحتوى الكامل لدى الناشر الأصلي.</p>
              <p className="mt-3 leading-7">تبقى الأخبار والصور والشعارات والعلامات التجارية ومواد الناشرين ملكًا لأصحابها.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900">هدفنا</h2>
              <p className="mt-3 leading-7">هدفنا تسهيل اكتشاف الأخبار وتنظيمها ومتابعتها من مصادر وتصنيفات متعددة في تجربة واضحة وسريعة.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900">الحسابات</h2>
              <p className="mt-3 leading-7">يمكن للمستخدم إنشاء حساب للوصول إلى ميزات إضافية مثل المفضلة ومتابعة المصادر. وتتم معالجة معلومات الحساب وفقًا لسياسة الخصوصية.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900">تواصل معنا</h2>
              <p className="mt-3 leading-7">للاستفسارات أو الاقتراحات أو الملاحظات، يمكنك زيارة صفحة التواصل معنا.</p>
              <a href="/contact" className="mt-3 inline-block font-semibold text-blue-600 hover:text-blue-800">صفحة التواصل</a>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
