export default function MadaPlayerDeleteAccountPage() {
  return (
    <main className="mada-page min-h-screen bg-transparent">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            MADA Player — Account Deletion
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: September 6, 2026
          </p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900">1. Request Account Deletion</h2>
              <p className="mt-3 leading-7">
                You can request deletion of your MADA Player account and the personal and
                cloud data associated with that account.
              </p>
              <p className="mt-3 leading-7">
                To submit a deletion request, send an email from the address associated with
                your MADA Player account to:
              </p>
              <a
                href="mailto:contact@madaalalam.com?subject=MADA%20Player%20Account%20Deletion%20Request"
                className="mt-3 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Request Account Deletion
              </a>
              <p className="mt-3 leading-7">
                Please include <strong>MADA Player Account Deletion Request</strong> in the
                subject and provide the email address used for your MADA Player account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">2. What Will Be Deleted</h2>
              <p className="mt-3 leading-7">
                After the request is verified and processed, we will delete or de-identify,
                as applicable, account information and associated cloud data that is no
                longer required to be retained. This may include:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Your MADA Player account and account identifier.</li>
                <li>Cloud-synchronized player data associated with your account.</li>
                <li>Cloud-stored sources, channels, favorites, watchlist, and playback data associated with the account, where applicable.</li>
                <li>Other account-specific information that is not required for legitimate retention purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">3. Information That May Be Retained</h2>
              <p className="mt-3 leading-7">
                Some information may be retained for a limited period when necessary to
                comply with legal obligations, maintain security, prevent fraud or abuse,
                resolve disputes, enforce agreements, or maintain required financial and
                transaction records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">4. Data Stored on Your Device</h2>
              <p className="mt-3 leading-7">
                Account deletion from our services does not automatically erase every piece
                of locally stored application data from your device. If needed, remove local
                MADA Player data using the application&apos;s available data controls or your
                device&apos;s application settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">5. Subscriptions and Payments</h2>
              <p className="mt-3 leading-7">
                Deleting your MADA Player account does not necessarily cancel a Premium
                subscription purchased through Google Play or another platform. To avoid
                future subscription charges, cancel the subscription through the platform
                where it was purchased.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">6. Need Help?</h2>
              <p className="mt-3 leading-7">
                If you cannot access your account or need help submitting a deletion request,
                contact us directly:
              </p>
              <a
                href="mailto:contact@madaalalam.com"
                className="mt-3 inline-block font-semibold text-blue-600 hover:text-blue-800"
              >
                contact@madaalalam.com
              </a>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
