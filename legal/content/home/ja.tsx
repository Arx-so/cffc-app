import { APP_NAME, SUPPORT_EMAIL } from "@/lib/site";
import { ROUTES } from "@/lib/i18n";

export default function HomeJa() {
  return (
    <main className="page">
      <span className="tag">法的情報センター</span>
      <h1>{APP_NAME}</h1>
      <p>
        アスリート、専門家（プロ）、サッカークラブをつなぐアプリです。ここでは、アプリに関する法的文書とサポート情報を確認できます。
      </p>

      <div className="home-links">
        <a href={`/ja/${ROUTES.privacy}`}>プライバシーポリシー →</a>
        <a href={`/ja/${ROUTES.terms}`}>利用規約 →</a>
        <a href={`/ja/${ROUTES.support}`}>サポート →</a>
        <a href={`/ja/${ROUTES.deleteAccount}`}>アカウントとデータの削除 →</a>
      </div>

      <footer>
        ご不明な点がございましたら、こちらまでご連絡ください:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </footer>
    </main>
  );
}
