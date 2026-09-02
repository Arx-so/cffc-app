import { APP_NAME, LEGAL_ENTITY, SUPPORT_EMAIL } from "@/lib/site";
import { LAST_UPDATED, ROUTES } from "@/lib/i18n";

export default function TermsEn() {
  return (
    <main className="page">
      <span className="tag">Legal Document</span>
      <h1>Terms of Use</h1>
      <p className="updated">Last updated: {LAST_UPDATED.en}</p>

      <p>
        These Terms of Use govern access to and use of the {APP_NAME} app,
        operated by {LEGAL_ENTITY}. By creating an account, you agree to
        these terms and to our{" "}
        <a href={`/en/${ROUTES.privacy}`}>Privacy Policy</a>.
      </p>

      <h2>1. What the app is</h2>
      <p>
        {APP_NAME} connects athletes, professionals (e.g. coaches, scouts),
        and football clubs, allowing athletes to share videos and profile
        information, professionals to record evaluations and validations,
        and clubs to discover and contact athletes.
      </p>

      <h2>2. Accounts and eligibility</h2>
      <ul>
        <li>You must provide truthful, up-to-date information when signing up.</li>
        <li>
          Users under 18 need the consent of a legal guardian, provided by
          email at sign-up.
        </li>
        <li>You are responsible for keeping your password confidential.</li>
        <li>
          Each person may keep only one account, associated with a single
          role (athlete, professional, club, or administrator).
        </li>
      </ul>

      <h2>3. User-submitted content</h2>
      <ul>
        <li>
          Videos, photos, documents, and evaluations submitted to the app go
          through a moderation process before becoming visible to other
          users.
        </li>
        <li>
          You are responsible for the content you submit and confirm you
          hold the necessary rights to it.
        </li>
        <li>
          Professionals are responsible for the accuracy of the evaluations
          and validations they record about athletes.
        </li>
        <li>
          Submitting false, offensive, illegal content, or content that
          infringes third-party rights, is prohibited.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>By using the app, you agree not to:</p>
      <ul>
        <li>Impersonate another person or provide third-party data without authorization;</li>
        <li>Use the app for unauthorized commercial purposes;</li>
        <li>Attempt to access other users&apos; data without permission;</li>
        <li>Interfere with the operation of the app or its servers.</li>
      </ul>

      <h2>5. Suspension and termination</h2>
      <p>
        We may suspend or terminate accounts that violate these terms. You
        can close your account at any time at{" "}
        <em>Settings → Delete account</em>, as described on the{" "}
        <a href={`/en/${ROUTES.deleteAccount}`}>Account &amp; Data Deletion</a>{" "}
        page.
      </p>

      <h2>6. Disclaimer</h2>
      <p>
        The app is a tool for connection and information organization. We do
        not guarantee the accuracy of evaluations entered by third parties,
        nor are we a party to negotiations between athletes, professionals,
        and clubs.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these terms periodically. Material changes will be
        communicated inside the app.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </main>
  );
}
