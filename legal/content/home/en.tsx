import { APP_NAME, SUPPORT_EMAIL } from "@/lib/site";
import { ROUTES } from "@/lib/i18n";

export default function HomeEn() {
  return (
    <main className="page">
      <span className="tag">Legal Center</span>
      <h1>{APP_NAME}</h1>
      <p>
        An app connecting athletes, professionals, and football clubs. Here
        you&apos;ll find the app&apos;s legal documents and support.
      </p>

      <div className="home-links">
        <a href={`/en/${ROUTES.privacy}`}>Privacy Policy →</a>
        <a href={`/en/${ROUTES.terms}`}>Terms of Use →</a>
        <a href={`/en/${ROUTES.support}`}>Support →</a>
        <a href={`/en/${ROUTES.deleteAccount}`}>Account &amp; Data Deletion →</a>
      </div>

      <footer>
        Questions? Reach us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </footer>
    </main>
  );
}
