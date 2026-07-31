import { APP_NAME, SUPPORT_EMAIL } from "@/lib/site";

export default function HomePage() {
  return (
    <main className="page">
      <span className="tag">Central Legal</span>
      <h1>{APP_NAME}</h1>
      <p>
        Aplicativo de conexão entre atletas, profissionais e clubes de
        futebol. Aqui você encontra os documentos legais e o suporte do app.
      </p>

      <div className="home-links">
        <a href="/privacidade">Política de Privacidade →</a>
        <a href="/termos">Termos de Uso →</a>
        <a href="/suporte">Suporte →</a>
        <a href="/exclusao-de-conta">Exclusão de Conta e Dados →</a>
      </div>

      <footer>
        Dúvidas? Fale conosco em{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </footer>
    </main>
  );
}
