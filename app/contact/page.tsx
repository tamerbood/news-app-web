export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Contact Us
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            We would love to hear from you.
          </p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900">
                Get in Touch
              </h2>

              <p className="mt-3 leading-7">
                If you have questions, suggestions, feedback,
                or need help with News App, you can contact
                us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                Support
              </h2>

              <p className="mt-3 leading-7">
                For account-related questions or problems
                with the application, please contact our
                support team.
              </p>

              <div className="mt-4 rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  Support Email
                </p>

                <a
                  href="mailto:support@example.com"
                  className="mt-1 inline-block font-semibold text-blue-600 hover:text-blue-800"
                >
                  support@example.com
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                Feedback and Suggestions
              </h2>

              <p className="mt-3 leading-7">
                We welcome feedback that can help us improve
                News App, including suggestions for new
                features, categories, news sources, and
                improvements to the user experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                News Content
              </h2>

              <p className="mt-3 leading-7">
                If you believe that information or content
                displayed through News App requires attention,
                please contact us with the relevant article
                or source information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                Account and Privacy Requests
              </h2>

              <p className="mt-3 leading-7">
                For questions concerning your account or
                personal information, please contact us using
                the support email above.
              </p>

              <p className="mt-3 leading-7">
                For more information about how we handle
                personal information, please review our
                Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}