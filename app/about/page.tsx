export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            About News App
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Your simple destination for the latest news.
          </p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900">
                What is News App?
              </h2>

              <p className="mt-3 leading-7">
                News App is a news aggregation platform designed
                to help users discover the latest stories from
                trusted news sources in one convenient place.
              </p>

              <p className="mt-3 leading-7">
                The application organizes news into categories
                and provides a simple interface for browsing,
                searching, and reading articles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                What You Can Do
              </h2>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Browse the latest news articles.</li>
                <li>Search for news by keyword.</li>
                <li>Filter articles by category.</li>
                <li>Filter articles by news source.</li>
                <li>Open the original news article.</li>
                <li>Save articles to your favorites.</li>
                <li>Follow news sources.</li>
                <li>Manage your personal account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                News Sources
              </h2>

              <p className="mt-3 leading-7">
                News App retrieves news information from
                third-party publishers and RSS feeds.
              </p>

              <p className="mt-3 leading-7">
                The application provides links to original
                publishers whenever available so that users
                can access the complete article from its
                original source.
              </p>

              <p className="mt-3 leading-7">
                News content, images, logos, trademarks, and
                other publisher materials remain the property
                of their respective owners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                Our Goal
              </h2>

              <p className="mt-3 leading-7">
                Our goal is to make discovering news simple,
                organized, and convenient while helping users
                find stories from different categories and
                sources in one place.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                User Accounts
              </h2>

              <p className="mt-3 leading-7">
                Users can create an account to access additional
                features such as favorites and followed news
                sources.
              </p>

              <p className="mt-3 leading-7">
                Account-related information is handled according
                to our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                Contact
              </h2>

              <p className="mt-3 leading-7">
                If you have questions, suggestions, or feedback
                about News App, please visit our Contact page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}