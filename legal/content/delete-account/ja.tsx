import { APP_NAME, SUPPORT_EMAIL } from "@/lib/site";

export default function DeleteAccountJa() {
  return (
    <main className="page">
      <span className="tag">データ</span>
      <h1>アカウントとデータの削除</h1>
      <p>
        {APP_NAME} のアカウントおよびそれに紐づくすべての個人データは、いつでも次の2つの方法で削除できます。
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          1. アプリから削除する（推奨）
        </h2>
        <ol>
          <li>{APP_NAME} アプリを開き、ログインします</li>
          <li>
            <strong>プロフィール → 設定</strong> に移動します
          </li>
          <li>
            <strong>アカウントを削除</strong> をタップして確認します
          </li>
        </ol>
        <p>削除は即時に行われ、取り消すことはできません。</p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          2. メールで削除を依頼する
        </h2>
        <p>
          アカウントに登録済みのメールアドレスから{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}
          宛にアカウント削除のご依頼をお送りください。15日以内に処理いたします。
        </p>
      </div>

      <h2>削除されるデータ</h2>
      <ul>
        <li>プロフィールデータ：氏名、ユーザー名、メールアドレス、電話番号、生年月日、市区町村/都道府県、写真</li>
        <li>アスリートデータ：身長、体重、ポジション、所属クラブ履歴</li>
        <li>専門家データ：専門分野、専門資格登録番号、資格証明書類</li>
        <li>アップロードされた動画とサムネイル</li>
        <li>アカウントに紐づく評価・検証データ</li>
        <li>お気に入りリスト（クラブアカウントの場合）</li>
        <li>認証（ログイン）アカウント自体</li>
      </ul>

      <h2>保持される可能性があるデータ</h2>
      <p>
        法的義務の遵守や訴訟対応など、法律上保持が義務付けられている記録については、アカウント削除後も法律で定められた期間、隔離された状態でアクセスを制限した上で保持される場合があります。
      </p>

      <p>
        ご不明な点がございましたら、こちらまでご連絡ください:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </main>
  );
}
