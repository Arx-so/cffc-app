import { APP_NAME, LEGAL_ENTITY, SUPPORT_EMAIL } from "@/lib/site";
import { LAST_UPDATED, ROUTES } from "@/lib/i18n";

export default function PrivacyEn() {
  return (
    <main className="page">
      <span className="tag">Legal Document</span>
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: {LAST_UPDATED.en}</p>

      <p>
        This Privacy Policy describes how {APP_NAME} (&quot;the app&quot;,
        &quot;we&quot;), operated by {LEGAL_ENTITY}, collects, uses, shares,
        and protects the personal data of the people who use the app, in
        accordance with Brazil&apos;s General Data Protection Law (LGPD — Law
        No. 13,709/2018) and the requirements of Google Play and the Apple
        App Store.
      </p>

      <div className="card">
        <strong>Data controller:</strong> {LEGAL_ENTITY}
        <br />
        <strong>Contact:</strong>{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </div>

      <h2>1. What data we collect</h2>
      <p>
        We only collect the data necessary for the app to function. Nothing
        is collected through advertising, analytics, or tracking SDKs —{" "}
        {APP_NAME} does not use tools of that kind.
      </p>

      <h3>1.1 Account and profile data</h3>
      <ul>
        <li>Full name and username</li>
        <li>Email and password (the password is securely managed by our authentication provider)</li>
        <li>Phone number (optional)</li>
        <li>Date of birth</li>
        <li>City and state (optional)</li>
        <li>Role in the app: athlete, professional (e.g. coach, scout), club, or administrator</li>
        <li>Profile photo</li>
        <li>
          When the user is under 18: a legal guardian&apos;s email, collected
          at sign-up for minor-safeguarding purposes
        </li>
      </ul>

      <h3>1.2 Athlete-specific data</h3>
      <ul>
        <li>Height, weight, and dominant foot</li>
        <li>Field positions and strengths</li>
        <li>Current category and market status (availability)</li>
        <li>Club history</li>
        <li>Videos and thumbnails submitted for evaluation</li>
      </ul>

      <h3>1.3 Professional-specific data</h3>
      <ul>
        <li>Specialty, institution, and professional registration number</li>
        <li>
          Credential documents (PDF or image) submitted to verify
          professional activity
        </li>
      </ul>

      <h3>1.4 Health and physical performance data (sensitive category)</h3>
      <p>
        Professionals registered on the app can record evaluations about an
        athlete, which may include sensitive health data under Article 5,
        II of the LGPD:
      </p>
      <ul>
        <li>Body composition (bioimpedance, body fat %, muscle mass)</li>
        <li>Biochemical tests (e.g. glucose, cholesterol, blood count)</li>
        <li>Physical performance tests (strength, speed, endurance, VO2 max)</li>
        <li>Dental evaluations</li>
        <li>Psychological evaluations (mood, anxiety, and motivation scales)</li>
      </ul>
      <p>
        This data is entered by the professional responsible for the
        evaluation and is visible only to the evaluated athlete and to
        whoever has permission to access that professional&apos;s profile
        within the app. It is not used for any purpose beyond the athlete&apos;s
        sports evaluation.
      </p>

      <h3>1.5 Usage data</h3>
      <p>
        Counts of approved videos, received validations, and accepted
        contact requests, used only to display statistics on the athlete&apos;s
        profile. Clubs can also keep a list of favorited athletes
        (shortlist).
      </p>

      <h2>2. How we use the data</h2>
      <ul>
        <li>Create and authenticate the user&apos;s account</li>
        <li>Display the athlete, professional, or club profile to other authorized users</li>
        <li>Enable professional evaluations and validations of athletes</li>
        <li>Allow clubs and professionals to contact athletes</li>
        <li>Moderate submitted content (videos and documents go through approval)</li>
        <li>Comply with legal and security obligations</li>
      </ul>

      <h2>3. Who we share data with</h2>
      <p>We do not sell personal data. We share data only with:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — our database, authentication, and file
          storage provider, which processes data on our behalf under a
          confidentiality agreement
        </li>
        <li>
          <strong>Google</strong> — only if the user chooses to sign in with
          Google (OAuth), for authentication purposes
        </li>
        <li>
          Other users of the app, within each role&apos;s visibility limits
          (for example, a club can see the profile and phone number of an
          athlete who accepted a contact request)
        </li>
      </ul>
      <p>
        We do not use advertising SDKs, third-party analytics, or
        cross-app/site tracking.
      </p>

      <h2>4. Data retention and deletion</h2>
      <p>
        We keep personal data for as long as the account is active. Users can
        delete their account and all associated data at any time from within
        the app, at <em>Settings → Delete account</em>, or by requesting it
        via email at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. See details
        on the{" "}
        <a href={`/en/${ROUTES.deleteAccount}`}>Account &amp; Data Deletion</a>{" "}
        page.
      </p>

      <h2>5. Security</h2>
      <p>
        Session tokens are stored encrypted on the device (Keychain/Keystore,
        via Secure Store). Communication with our servers uses HTTPS, and
        access to database records is restricted by Row Level Security
        policies, ensuring each user can only access the data they are
        permitted to.
      </p>

      <h2>6. Data subject rights (LGPD)</h2>
      <p>You may, at any time, request:</p>
      <ul>
        <li>Confirmation of the existence of processing and access to the data</li>
        <li>Correction of incomplete, inaccurate, or outdated data</li>
        <li>Anonymization, blocking, or deletion of unnecessary data</li>
        <li>Portability of data to another service provider</li>
        <li>Deletion of data processed with consent</li>
        <li>Revocation of consent</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We will
        respond within 15 days.
      </p>

      <h2>7. Children&apos;s and teenagers&apos; data</h2>
      <p>
        {APP_NAME} is not intended for children. Users under 18 must provide
        a legal guardian&apos;s email at sign-up, in accordance with Article
        14 of the LGPD, which requires specific consent from at least one
        parent or legal guardian for processing the data of children and
        teenagers.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We may update this policy periodically. Material changes will be
        communicated inside the app. The last-updated date is always shown
        at the top of this page.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy or about how your data is processed:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </main>
  );
}
