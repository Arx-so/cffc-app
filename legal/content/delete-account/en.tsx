import { APP_NAME, SUPPORT_EMAIL } from "@/lib/site";

export default function DeleteAccountEn() {
  return (
    <main className="page">
      <span className="tag">Data</span>
      <h1>Account &amp; Data Deletion</h1>
      <p>
        You can delete your {APP_NAME} account and all personal data
        associated with it at any time, in two ways:
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          1. From the app (recommended)
        </h2>
        <ol>
          <li>Open the {APP_NAME} app and log in</li>
          <li>
            Go to <strong>Profile → Settings</strong>
          </li>
          <li>
            Tap <strong>Delete account</strong> and confirm
          </li>
        </ol>
        <p>Deletion is immediate and cannot be undone.</p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          2. By email
        </h2>
        <p>
          Send an account deletion request to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, from the
          email address registered on your account. We process requests
          within 15 days.
        </p>
      </div>

      <h2>What gets deleted</h2>
      <ul>
        <li>Profile data: name, username, email, phone, date of birth, city/state, photo</li>
        <li>Athlete data: height, weight, positions, club history</li>
        <li>Professional data: specialty, professional registration, credential documents</li>
        <li>Uploaded videos and thumbnails</li>
        <li>Evaluations and validations linked to your account</li>
        <li>Favorites list (for club accounts)</li>
        <li>The authentication (login) account itself</li>
      </ul>

      <h2>What may be retained</h2>
      <p>
        Records we are legally required to keep (for example, to comply with
        legal obligations or defend against claims) may be retained for the
        period required by law, isolated and with restricted access, even
        after the account is deleted.
      </p>

      <p>
        Questions? Reach us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </main>
  );
}
