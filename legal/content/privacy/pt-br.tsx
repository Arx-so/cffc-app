import { APP_NAME, LEGAL_ENTITY, SUPPORT_EMAIL } from "@/lib/site";
import { LAST_UPDATED, ROUTES } from "@/lib/i18n";

export default function PrivacyPtBr() {
  return (
    <main className="page">
      <span className="tag">Documento Legal</span>
      <h1>Política de Privacidade</h1>
      <p className="updated">Última atualização: {LAST_UPDATED["pt-br"]}</p>

      <p>
        Esta Política de Privacidade descreve como o {APP_NAME}{" "}
        (&quot;app&quot;, &quot;nós&quot;), operado por {LEGAL_ENTITY}, coleta,
        usa, compartilha e protege dados pessoais de quem usa o aplicativo,
        em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº
        13.709/2018) e com as exigências da Google Play e da Apple App Store.
      </p>

      <div className="card">
        <strong>Controlador dos dados:</strong> {LEGAL_ENTITY}
        <br />
        <strong>Contato:</strong>{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </div>

      <h2>1. Quais dados coletamos</h2>
      <p>
        Coletamos apenas os dados necessários para o funcionamento do app.
        Nada é coletado por SDKs de publicidade, analytics ou rastreamento —
        o {APP_NAME} não utiliza esse tipo de ferramenta.
      </p>

      <h3>1.1 Dados de conta e perfil</h3>
      <ul>
        <li>Nome completo e nome de usuário</li>
        <li>E-mail e senha (a senha é gerida com segurança pelo provedor de autenticação)</li>
        <li>Telefone (opcional)</li>
        <li>Data de nascimento</li>
        <li>Cidade e estado (opcional)</li>
        <li>Papel no app: atleta, profissional (ex: preparador, olheiro), clube ou administrador</li>
        <li>Foto de perfil</li>
        <li>
          Quando o usuário é menor de 18 anos: e-mail de um responsável legal,
          coletado no cadastro para fins de salvaguarda de menores
        </li>
      </ul>

      <h3>1.2 Dados específicos de atletas</h3>
      <ul>
        <li>Altura, peso e pé dominante</li>
        <li>Posições em campo e pontos fortes</li>
        <li>Categoria atual e situação de mercado (disponibilidade)</li>
        <li>Histórico de clubes</li>
        <li>Vídeos e miniaturas enviados para avaliação</li>
      </ul>

      <h3>1.3 Dados específicos de profissionais</h3>
      <ul>
        <li>Especialidade, instituição e número de registro profissional</li>
        <li>
          Documentos de credencial (PDF ou imagem) enviados para verificação
          da atuação profissional
        </li>
      </ul>

      <h3>1.4 Dados de saúde e desempenho físico (categoria sensível)</h3>
      <p>
        Profissionais cadastrados no app podem registrar avaliações sobre um
        atleta, que podem incluir dados sensíveis de saúde, nos termos do
        art. 5º, II da LGPD:
      </p>
      <ul>
        <li>Composição corporal (bioimpedância, % de gordura, massa muscular)</li>
        <li>Exames bioquímicos (ex: glicose, colesterol, hemograma)</li>
        <li>Testes de desempenho físico (força, velocidade, resistência, VO2 máx.)</li>
        <li>Avaliações odontológicas</li>
        <li>Avaliações psicológicas (escalas de humor, ansiedade e motivação)</li>
      </ul>
      <p>
        Esses dados são inseridos pelo próprio profissional responsável pela
        avaliação e ficam visíveis apenas ao atleta avaliado e a quem tiver
        permissão de acesso ao perfil profissional dele dentro do app. Eles
        não são usados para nenhuma finalidade além da avaliação esportiva do
        atleta.
      </p>

      <h3>1.5 Dados de uso</h3>
      <p>
        Contagens de vídeos aprovados, validações recebidas e solicitações de
        contato aceitas, usadas apenas para exibir estatísticas no perfil do
        atleta. Clubes também podem manter uma lista de atletas favoritados
        (shortlist).
      </p>

      <h2>2. Como usamos os dados</h2>
      <ul>
        <li>Criar e autenticar a conta do usuário</li>
        <li>Exibir o perfil do atleta, profissional ou clube para outros usuários autorizados</li>
        <li>Permitir avaliações profissionais e validações sobre atletas</li>
        <li>Permitir que clubes e profissionais entrem em contato com atletas</li>
        <li>Moderar conteúdo enviado (vídeos e documentos passam por aprovação)</li>
        <li>Cumprir obrigações legais e de segurança</li>
      </ul>

      <h2>3. Com quem compartilhamos dados</h2>
      <p>Não vendemos dados pessoais. Compartilhamos dados apenas com:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — nosso provedor de banco de dados,
          autenticação e armazenamento de arquivos, que processa os dados em
          nosso nome sob contrato de confidencialidade
        </li>
        <li>
          <strong>Google</strong> — apenas se o usuário optar por entrar com
          login social do Google (OAuth), para fins de autenticação
        </li>
        <li>
          Outros usuários do app, dentro dos limites de visibilidade de cada
          papel (por exemplo, um clube vê o perfil e o telefone de um atleta
          que aceitou uma solicitação de contato)
        </li>
      </ul>
      <p>
        Não utilizamos SDKs de publicidade, analytics de terceiros ou
        rastreamento entre apps/sites.
      </p>

      <h2>4. Retenção e exclusão de dados</h2>
      <p>
        Mantemos os dados pessoais enquanto a conta estiver ativa. O usuário
        pode excluir sua conta e todos os dados associados a qualquer momento
        pelo próprio app, em{" "}
        <em>Configurações → Excluir conta</em>, ou solicitando por e-mail em{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Veja detalhes
        na página{" "}
        <a href={`/pt-br/${ROUTES.deleteAccount}`}>Exclusão de Conta e Dados</a>.
      </p>

      <h2>5. Segurança</h2>
      <p>
        Tokens de sessão são armazenados de forma criptografada no dispositivo
        (Keychain/Keystore, via Secure Store). A comunicação com nossos
        servidores é feita por HTTPS, e o acesso aos dados no banco é
        restrito por políticas de segurança em nível de linha (Row Level
        Security), garantindo que cada usuário só acesse os dados aos quais
        tem permissão.
      </p>

      <h2>6. Direitos do titular (LGPD)</h2>
      <p>Você pode, a qualquer momento, solicitar:</p>
      <ul>
        <li>Confirmação da existência de tratamento e acesso aos dados</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
        <li>Portabilidade dos dados a outro fornecedor de serviço</li>
        <li>Eliminação dos dados tratados com consentimento</li>
        <li>Revogação do consentimento</li>
      </ul>
      <p>
        Para exercer qualquer um desses direitos, entre em contato pelo
        e-mail <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        Responderemos em até 15 dias.
      </p>

      <h2>7. Dados de crianças e adolescentes</h2>
      <p>
        O {APP_NAME} não é destinado a crianças. Usuários menores de 18 anos
        devem informar o e-mail de um responsável legal no momento do
        cadastro, em conformidade com o art. 14 da LGPD, que exige consentimento
        específico de ao menos um dos pais ou responsável legal para o
        tratamento de dados de crianças e adolescentes.
      </p>

      <h2>8. Alterações a esta política</h2>
      <p>
        Podemos atualizar esta política periodicamente. Alterações relevantes
        serão comunicadas dentro do app. A data da última atualização está
        sempre indicada no topo desta página.
      </p>

      <h2>9. Contato</h2>
      <p>
        Dúvidas sobre esta política ou sobre o tratamento dos seus dados:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </main>
  );
}
