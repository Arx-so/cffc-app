import {
  ANDROID_PACKAGE,
  APP_NAME,
  IOS_BUNDLE_ID,
  SUPPORT_EMAIL,
} from "@/lib/site";
import { ROUTES } from "@/lib/i18n";

export default function SupportEn() {
  return (
    <main className="page">
      <span className="tag">Support</span>
      <h1>Support — {APP_NAME}</h1>
      <p>
        This is the official support page for the <strong>{APP_NAME}</strong>{" "}
        app (iOS: <code>{IOS_BUNDLE_ID}</code> · Android: <code>{ANDROID_PACKAGE}</code>).
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          Contact us
        </h2>
        <p>
          For questions, technical issues, or requests related to your
          account or your data, email us at:
        </p>
        <p style={{ fontSize: 18 }}>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        <p>We reply within 2 business days.</p>
      </div>

      <h2>Frequently asked questions</h2>

      <p>
        <strong>How do I delete my account and my data?</strong>
        <br />
        Go to <em>Settings → Delete account</em> inside the app, or see the
        step-by-step guide at{" "}
        <a href={`/en/${ROUTES.deleteAccount}`}>Account &amp; Data Deletion</a>.
      </p>

      <p>
        <strong>My video or document wasn&apos;t approved — what happened?</strong>
        <br />
        Videos, avatars, and documents go through moderation before becoming
        publicly visible. If a submission was rejected, contact us at the
        email above to find out why.
      </p>

      <p>
        <strong>I forgot my password.</strong>
        <br />
        Use the password recovery option on the app&apos;s login screen.
      </p>

      <p>
        <strong>Where can I find the Privacy Policy and Terms of Use?</strong>
        <br />
        At <a href={`/en/${ROUTES.privacy}`}>Privacy Policy</a> and{" "}
        <a href={`/en/${ROUTES.terms}`}>Terms of Use</a>.
      </p>
    </main>
  );
}
