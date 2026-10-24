export default function ContactPage() {
  return (
    <main className="mada-page min-h-screen bg-transparent">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            تواصل معنا
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            يسعدنا أن نسمع منك.
          </p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section
              id="cvmada-data-deletion"
              aria-labelledby="cvmada-data-deletion-heading"
              className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 sm:p-7"
            >
              <div lang="ar" dir="rtl" className="text-right">
                <p className="text-sm font-semibold text-blue-700">CVMada / Mada - CV MAKER</p>
                <h2 id="cvmada-data-deletion-heading" className="mt-2 text-2xl font-bold text-gray-900">
                  طلب حذف بيانات تطبيق CVMada
                </h2>
                <p className="mt-3 leading-8">
                  هذه الخيارات مخصّصة لتطبيق إنشاء السير الذاتية CVMada
                  (<span dir="ltr" className="inline-block">com.mada.cvmada</span>).
                  لا يتطلب التطبيق إنشاء حساب مستقل، ويمكنك طلب حذف البيانات المرتبطة
                  باستخدامك للتطبيق دون إنشاء حساب أو إعادة تثبيت التطبيق.
                </p>

                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                    <h3 className="font-bold text-gray-900">1. حذف السير الذاتية والخطابات من جهازك</h3>
                    <p className="mt-2 leading-8">
                      يمكنك حذف السير الذاتية وخطابات التقديم من داخل CVMada. ولحذف
                      بيانات التطبيق المحلية بالكامل، افتح إعدادات Android، ثم التطبيقات،
                      ثم CVMada، ثم التخزين، واختر مسح البيانات؛ أو أزل التطبيق.
                      يؤدي مسح البيانات إلى فقدان المستندات والإعدادات المحفوظة محليًا.
                      لا يتيح لنا الموقع مسح الملفات الموجودة على جهازك عن بُعد.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                    <h3 className="font-bold text-gray-900">2. طلب حذف سجلات اشتراك Premium</h3>
                    <p className="mt-2 leading-8">
                      إذا اشتريت اشتراكًا عبر Google Play، فقد نحتفظ برمز الشراء
                      ومعرّف المنتج وحالة الاشتراك وتاريخ انتهائه للتحقق من الاستحقاق.
                      لطلب مراجعة هذه السجلات أو حذفها، أرسل طلبًا عبر البريد الإلكتروني.
                      قد نحتاج إلى التحقق من صلتك بالشراء قبل اتخاذ الإجراء، وقد نحتفظ
                      بما يلزم قانونيًا أو لأسباب أمنية أو لمنع الاحتيال.
                    </p>
                    <a
                      href="mailto:contact@madaalalam.com?subject=CVMada%20Subscription%20Data%20Deletion%20Request"
                      className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800"
                    >
                      إرسال طلب حذف بيانات الاشتراك
                    </a>
                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      حذف سجلّ من خادمنا لا يلغي اشتراك Google Play أو رسوم التجديد.
                      لإلغاء الاشتراك، استخدم{' '}
                      <a
                        href="https://play.google.com/store/account/subscriptions"
                        className="font-semibold text-blue-700 underline underline-offset-2"
                      >
                        إدارة اشتراكات Google Play
                      </a>.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                    <h3 className="font-bold text-gray-900">3. طلب حذف بيانات أخرى أو الاستفسار عنها</h3>
                    <p className="mt-2 leading-8">
                      لطلب مراجعة أي بيانات شخصية أخرى قد نعالجها في سياق CVMada
                      أو طلب حذفها حيثما ينطبق، تواصل معنا وحدد نوع البيانات المطلوب.
                      يمكنك أيضًا إدارة خيارات خصوصية الإعلانات داخل إعدادات التطبيق
                      عندما تكون متاحة. بيانات شركاء الإعلانات تخضع كذلك لسياساتهم.
                    </p>
                    <a
                      href="mailto:contact@madaalalam.com?subject=CVMada%20Data%20Deletion%20Request"
                      className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-700 bg-white px-5 py-3 text-center font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      طلب حذف بيانات CVMada
                    </a>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-gray-700">
                  <strong>تنبيه:</strong> الملفات التي صدّرتها أو شاركتها أو حفظتها في
                  خدمات أخرى لا تُحذف تلقائيًا عند حذف بيانات التطبيق. يُرجى حذف تلك
                  النسخ من أماكن حفظها أيضًا. لا ترسل كلمات المرور أو بيانات البطاقات
                  البنكية أو رموز الشراء السرية أو محتوى سيرتك الذاتية في رسالة الطلب.
                  يتم التعامل مع طلبات حذف بيانات الخادم بعد مراجعة الطلب والتحقق
                  عند الحاجة، مع مراعاة متطلبات الاحتفاظ القانونية والأمنية.
                </p>
                <p className="mt-3 text-sm leading-7">
                  البريد المخصص لاستقبال هذه الطلبات:{' '}
                  <a href="mailto:contact@madaalalam.com" className="font-semibold text-blue-700 underline underline-offset-2">
                    contact@madaalalam.com
                  </a>
                  {' '}—{' '}
                  <a href="/privacy#cvmada-privacy" className="font-semibold text-blue-700 underline underline-offset-2">
                    سياسة خصوصية CVMada
                  </a>
                </p>
              </div>

              <div lang="en" dir="ltr" className="mt-7 border-t border-blue-200 pt-6 text-left">
                <h3 className="text-lg font-bold text-gray-900">CVMada — Data Deletion Requests</h3>
                <p className="mt-2 leading-7">
                  CVMada (com.mada.cvmada) does not create separate app accounts.
                  You can delete resumes and cover letters in the app, or clear
                  CVMada&apos;s storage through Android Settings to remove local app
                  data. Exported or shared copies must be deleted where you saved them.
                </p>
                <p className="mt-3 leading-7">
                  To request deletion of subscription-verification records held by
                  us, or to request deletion of other CVMada-related personal data,
                  email{' '}
                  <a
                    href="mailto:contact@madaalalam.com?subject=CVMada%20Data%20Deletion%20Request"
                    className="font-semibold text-blue-700 underline underline-offset-2"
                  >
                    contact@madaalalam.com
                  </a>{' '}
                  with the subject <strong>CVMada Data Deletion Request</strong> and
                  describe what you want deleted. We may need to verify your request.
                  Some records may be retained for legal, security or fraud-prevention
                  reasons. Do not send passwords, purchase tokens, payment-card details,
                  or the contents of your resume.
                </p>
                <p className="mt-3 leading-7">
                  Deleting server-held records does not cancel a Google Play
                  subscription. Manage recurring payments in{' '}
                  <a
                    href="https://play.google.com/store/account/subscriptions"
                    className="font-semibold text-blue-700 underline underline-offset-2"
                  >
                    Google Play subscriptions
                  </a>.
                  {' '}See our{' '}
                  <a href="/privacy#cvmada-privacy" className="font-semibold text-blue-700 underline underline-offset-2">
                    CVMada Privacy Policy
                  </a>{' '}for more information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                تواصل معنا
              </h2>

              <p className="mt-3 leading-7">
                إذا كانت لديك أسئلة أو اقتراحات أو ملاحظات أو تحتاج إلى مساعدة بشأن مدى العالم، يمكنك التواصل معنا باستخدام المعلومات أدناه.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                الدعم
              </h2>

              <p className="mt-3 leading-7">
                للاستفسارات المتعلقة بالحساب أو المشكلات المتعلقة بالتطبيق، يمكنك التواصل مع فريق الدعم.
              </p>

              <div className="mt-4 rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  الدعم Email
                </p>

                <a
                  href="mailto:contact@madaalalam.com"
                  className="mt-1 inline-block font-semibold text-blue-600 hover:text-blue-800"
                >
                  contact@madaalalam.com
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                الملاحظات والاقتراحات
              </h2>

              <p className="mt-3 leading-7">
                We welcome feedback that can help us improve Mada Alalam,
                including suggestions for new features, categories, news
                sources, and improvements to the user experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                محتوى الأخبار
              </h2>

              <p className="mt-3 leading-7">
                If you believe that information or content displayed through
                Mada Alalam requires attention, please contact us with the
                relevant article or source information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                خدمات الجهات الخارجية
              </h2>

              <p className="mt-3 leading-7">
                Mada Alalam may use third-party services to provide certain
                features, including Firebase Cloud Messaging for notifications,
                weather services, and YouTube content.
              </p>

              <p className="mt-3 leading-7">
                When you access third-party content, websites, or services
                through Mada Alalam, those services may have their own terms
                of service and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                حذف حسابك
              </h2>

              <p className="mt-3 leading-7">
                If you would like to delete your Mada Alalam account and the
                personal data associated with it, you can request account
                deletion at any time.
              </p>

              <p className="mt-3 leading-7">
                If you can access your account, sign in to Mada Alalam, open
                your Account page, go to the Danger Zone section, select Delete
                My Account, enter your password, and confirm the deletion.
              </p>

              <p className="mt-3 leading-7">
                If you cannot access your account, you can request deletion by
                contacting our support team using the email address below.
                Please use the email address associated with your account and
                include &quot;Account Deletion Request&quot; in the subject
                line.
              </p>

              <div className="mt-4 rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  طلبات حذف الحساب
                </p>

                <a
                  href="mailto:contact@madaalalam.com?subject=Account%20Deletion%20Request"
                  className="mt-1 inline-block font-semibold text-blue-600 hover:text-blue-800"
                >
                  contact@madaalalam.com
                </a>
              </div>

              <p className="mt-3 leading-7">
                When an account is deleted, we delete the account and
                associated personal data, subject to information that we may
                be required to retain by law, security requirements, or other
                legitimate obligations.
              </p>
            </section>


            <section>
              <h2 className="text-xl font-bold text-gray-900">
                LUMZIQ Account Deletion
              </h2>

              <p className="mt-3 leading-7">
                To request deletion of your LUMZIQ account and associated data,
                contact us at: contact@madaalalam.com
              </p>

              <p className="mt-3 leading-7">
                Please send your request from the email address associated with
                your LUMZIQ account.
              </p>

              <p className="mt-3 leading-7">
                We will delete your account data, including profile information
                and synced project metadata.
              </p>

              <p className="mt-3 leading-7">
                Some records may be retained only when required for security,
                fraud prevention, legal, or regulatory obligations.
              </p>

              <div className="mt-4 rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  LUMZIQ Account Deletion Requests
                </p>

                <a
                  href="mailto:contact@madaalalam.com?subject=LUMZIQ%20Account%20Deletion%20Request"
                  className="mt-1 inline-block font-semibold text-blue-600 hover:text-blue-800"
                >
                  contact@madaalalam.com
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                Account and Privacy Requests
              </h2>

              <p className="mt-3 leading-7">
                For questions concerning your account or personal information,
                please contact us using the support email above.
              </p>

              <p className="mt-3 leading-7">
                For more information about how we handle personal information,
                please review our Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
