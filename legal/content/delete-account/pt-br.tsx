import { APP_NAME, SUPPORT_EMAIL } from "@/lib/site";

export default function DeleteAccountPtBr() {
  return (
    <main className="page">
      <span className="tag">Dados</span>
      <h1>Exclusão de Conta e Dados</h1>
      <p>
        Você pode excluir sua conta do {APP_NAME} e todos os dados pessoais
        associados a ela a qualquer momento, de duas formas:
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          1. Pelo próprio app (recomendado)
        </h2>
        <ol>
          <li>Abra o app {APP_NAME} e faça login</li>
          <li>
            Toque na aba <strong>Perfil</strong> e depois no ícone de menu no
            canto superior direito para abrir <strong>Configurações</strong>
          </li>
          <li>
            Toque em <strong>Excluir conta</strong> e confirme em{" "}
            <strong>Excluir permanentemente</strong>
          </li>
        </ol>
        <p>A exclusão é imediata e não pode ser desfeita.</p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, border: "none", paddingBottom: 0 }}>
          2. Por e-mail
        </h2>
        <p>
          Envie uma solicitação de exclusão de conta para{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, a partir do
          e-mail cadastrado na sua conta. Processamos o pedido em até 15
          dias.
        </p>
      </div>

      <h2>O que é excluído</h2>
      <ul>
        <li>Dados de perfil: nome, usuário, e-mail, telefone, data de nascimento, cidade/estado, foto</li>
        <li>Dados de atleta: altura, peso, posições, histórico de clubes</li>
        <li>Dados de profissional: especialidade, registro profissional, documentos de credencial</li>
        <li>Vídeos e miniaturas enviados</li>
        <li>Avaliações e validações associadas à sua conta</li>
        <li>Lista de favoritos (para contas de clube)</li>
        <li>A conta de autenticação (login) em si</li>
      </ul>

      <h2>O que pode ser retido</h2>
      <p>
        Registros que somos legalmente obrigados a manter (por exemplo, para
        cumprimento de obrigações legais ou defesa em processos) podem ser
        retidos pelo período exigido por lei, de forma isolada e com acesso
        restrito, mesmo após a exclusão da conta.
      </p>

      <p>
        Dúvidas? Fale conosco em{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </main>
  );
}
