import {
  ANDROID_PACKAGE,
  APP_NAME,
  IOS_BUNDLE_ID,
  SUPPORT_EMAIL,
} from "@/lib/site";
import { ROUTES } from "@/lib/i18n";

export default function SupportJa() {
  return (
    <main className="page">
      <span className="tag">サポート</span>
      <h1>サポート — {APP_NAME}</h1>
      <p>
        こちらは <strong>{APP_NAME}</strong> アプリの公式サポートページです
        （iOS: <code>{IOS_BUNDLE_ID}</code> ・ Android: <code>{ANDROID_PACKAGE}</code>）。
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          お問い合わせ
        </h2>
        <p>
          ご質問、技術的な問題、アカウントやデータに関するご依頼は、以下のメールアドレスまでご連絡ください。
        </p>
        <p style={{ fontSize: 18 }}>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        <p>2営業日以内にご返信いたします。</p>
      </div>

      <h2>よくある質問</h2>

      <p>
        <strong>アカウントとデータを削除するにはどうすればよいですか？</strong>
        <br />
        アプリ内の<em>設定 → アカウントを削除</em>からアクセスするか、
        <a href={`/ja/${ROUTES.deleteAccount}`}>アカウントとデータの削除</a>
        の手順をご確認ください。
      </p>

      <p>
        <strong>動画やドキュメントが承認されませんでした。何が起きたのですか？</strong>
        <br />
        動画、アバター、ドキュメントは公開前にモデレーション（審査）を経ます。承認されなかった場合は、上記のメールアドレスまでご連絡いただければ理由をご説明します。
      </p>

      <p>
        <strong>パスワードを忘れました。</strong>
        <br />
        アプリのログイン画面からパスワードの再設定を行ってください。
      </p>

      <p>
        <strong>プライバシーポリシーと利用規約はどこで確認できますか？</strong>
        <br />
        <a href={`/ja/${ROUTES.privacy}`}>プライバシーポリシー</a>と
        <a href={`/ja/${ROUTES.terms}`}>利用規約</a>をご覧ください。
      </p>
    </main>
  );
}
