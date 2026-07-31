import { APP_NAME, LAST_UPDATED, LEGAL_ENTITY, SUPPORT_EMAIL } from "@/lib/site";

export const metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  return (
    <main className="page">
      <span className="tag">Documento Legal</span>
      <h1>Termos de Uso</h1>
      <p className="updated">Última atualização: {LAST_UPDATED}</p>

      <p>
        Estes Termos de Uso regem o acesso e uso do aplicativo {APP_NAME},
        operado por {LEGAL_ENTITY}. Ao criar uma conta, você concorda com
        estes termos e com a nossa{" "}
        <a href="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>1. O que é o app</h2>
      <p>
        O {APP_NAME} conecta atletas, profissionais (ex: preparadores,
        olheiros) e clubes de futebol, permitindo que atletas compartilhem
        vídeos e informações de perfil, que profissionais registrem
        avaliações e validações, e que clubes descubram e entrem em contato
        com atletas.
      </p>

      <h2>2. Contas e elegibilidade</h2>
      <ul>
        <li>Você deve fornecer informações verdadeiras e atualizadas no cadastro.</li>
        <li>
          Usuários menores de 18 anos precisam do consentimento de um
          responsável legal, informado por e-mail no cadastro.
        </li>
        <li>Você é responsável por manter a confidencialidade da sua senha.</li>
        <li>
          Cada pessoa pode manter apenas uma conta, associada a um único
          papel (atleta, profissional, clube ou administrador).
        </li>
      </ul>

      <h2>3. Conteúdo enviado pelo usuário</h2>
      <ul>
        <li>
          Vídeos, fotos, documentos e avaliações enviados ao app passam por
          um processo de moderação antes de ficarem visíveis a outros
          usuários.
        </li>
        <li>
          Você é responsável pelo conteúdo que envia e garante ter os
          direitos necessários sobre ele.
        </li>
        <li>
          Profissionais são responsáveis pela exatidão das avaliações e
          validações que registram sobre atletas.
        </li>
        <li>
          É proibido enviar conteúdo falso, ofensivo, ilegal ou que viole
          direitos de terceiros.
        </li>
      </ul>

      <h2>4. Uso aceitável</h2>
      <p>Ao usar o app, você concorda em não:</p>
      <ul>
        <li>Se passar por outra pessoa ou fornecer dados de terceiros sem autorização;</li>
        <li>Usar o app para fins comerciais não autorizados;</li>
        <li>Tentar acessar dados de outros usuários sem permissão;</li>
        <li>Interferir no funcionamento do app ou de seus servidores.</li>
      </ul>

      <h2>5. Suspensão e encerramento</h2>
      <p>
        Podemos suspender ou encerrar contas que violem estes termos. Você
        pode encerrar sua conta a qualquer momento em{" "}
        <em>Configurações → Excluir conta</em>, conforme descrito na página{" "}
        <a href="/exclusao-de-conta">Exclusão de Conta e Dados</a>.
      </p>

      <h2>6. Isenção de responsabilidade</h2>
      <p>
        O app é uma ferramenta de conexão e organização de informações. Não
        garantimos a exatidão de avaliações inseridas por terceiros nem
        somos parte em negociações entre atletas, profissionais e clubes.
      </p>

      <h2>7. Alterações</h2>
      <p>
        Podemos atualizar estes termos periodicamente. Alterações relevantes
        serão comunicadas dentro do app.
      </p>

      <h2>8. Contato</h2>
      <p>
        Dúvidas sobre estes termos: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </main>
  );
}
