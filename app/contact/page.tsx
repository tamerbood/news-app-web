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
