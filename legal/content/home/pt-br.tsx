import { APP_NAME, SUPPORT_EMAIL } from "@/lib/site";
import { ROUTES } from "@/lib/i18n";

export default function HomePtBr() {
  return (
    <main className="page">
      <span className="tag">Central Legal</span>
      <h1>{APP_NAME}</h1>
      <p>
        Aplicativo de conexão entre atletas, profissionais e clubes de
        futebol. Aqui você encontra os documentos legais e o suporte do app.
      </p>

      <div className="home-links">
        <a href={`/pt-br/${ROUTES.privacy}`}>Política de Privacidade →</a>
        <a href={`/pt-br/${ROUTES.terms}`}>Termos de Uso →</a>
        <a href={`/pt-br/${ROUTES.support}`}>Suporte →</a>
        <a href={`/pt-br/${ROUTES.deleteAccount}`}>Exclusão de Conta e Dados →</a>
      </div>

      <footer>
        Dúvidas? Fale conosco em{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </footer>
    </main>
  );
}
