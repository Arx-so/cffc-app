import {
  ANDROID_PACKAGE,
  APP_NAME,
  IOS_BUNDLE_ID,
  SUPPORT_EMAIL,
} from "@/lib/site";
import { ROUTES } from "@/lib/i18n";

export default function SupportPtBr() {
  return (
    <main className="page">
      <span className="tag">Suporte</span>
      <h1>Suporte — {APP_NAME}</h1>
      <p>
        Esta é a página oficial de suporte do aplicativo <strong>{APP_NAME}</strong>{" "}
        (iOS: <code>{IOS_BUNDLE_ID}</code> · Android: <code>{ANDROID_PACKAGE}</code>).
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          Fale conosco
        </h2>
        <p>
          Para dúvidas, problemas técnicos, solicitações relacionadas à sua
          conta ou aos seus dados, envie um e-mail para:
        </p>
        <p style={{ fontSize: 18 }}>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        <p>Respondemos em até 2 dias úteis.</p>
      </div>

      <h2>Perguntas frequentes</h2>

      <p>
        <strong>Como excluo minha conta e meus dados?</strong>
        <br />
        Acesse <em>Configurações → Excluir conta</em> dentro do app, ou veja
        o passo a passo em{" "}
        <a href={`/pt-br/${ROUTES.deleteAccount}`}>Exclusão de Conta e Dados</a>.
      </p>

      <p>
        <strong>Meu vídeo ou documento não foi aprovado, o que aconteceu?</strong>
        <br />
        Vídeos, avatares e documentos passam por moderação antes de ficarem
        visíveis publicamente. Se um envio foi rejeitado, entre em contato
        pelo e-mail acima para entender o motivo.
      </p>

      <p>
        <strong>Esqueci minha senha.</strong>
        <br />
        Use a opção de recuperação de senha na tela de login do app.
      </p>

      <p>
        <strong>Onde vejo a Política de Privacidade e os Termos de Uso?</strong>
        <br />
        Em <a href={`/pt-br/${ROUTES.privacy}`}>Política de Privacidade</a> e{" "}
        <a href={`/pt-br/${ROUTES.terms}`}>Termos de Uso</a>.
      </p>
    </main>
  );
}
