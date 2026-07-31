# Requisitos de loja (Google Play + Apple App Store)

Checklist prático para publicar o Big Eye Scout. As páginas legais vivem em
`/legal` (deploy separado na Vercel) — ver `legal/README.md` para o passo a
passo de deploy.

## 0. URLs (preencher depois do deploy)

Depois de publicar `/legal` na Vercel:

1. Atualize `SITE_URL` em `legal/lib/site.ts` com o domínio final.
2. Atualize `LegalUrls` em `src/constants/legal.ts` com as mesmas URLs.
3. Use essas URLs nos formulários abaixo:

| URL | Uso |
|---|---|
| `/privacidade` | Privacy Policy URL — Play Console e App Store Connect |
| `/suporte` | Support URL — App Store Connect |
| `/termos` | Terms of Use (EULA) — App Store Connect (opcional, se não usar a EULA padrão da Apple) |
| `/exclusao-de-conta` | Link de exclusão de conta/dados — pode ser referenciado no Data Safety Form da Play |

## 1. Google Play — Política de Privacidade

- Play Console → **Presença na loja → Política de Privacidade** → cole a URL de `/privacidade`.
- Precisa estar acessível publicamente sem login (confirmado: página estática Next.js, sem auth).

## 2. Google Play — Data Safety Form

Play Console → **Política → Segurança dos dados**. Baseado no levantamento real do código-fonte:

| Categoria (Play) | Coletado? | Compartilhado? | Finalidade | Campo no app |
|---|---|---|---|---|
| Nome | Sim | Não | Funcionalidade do app | `profile.name` |
| E-mail | Sim | Não | Funcionalidade do app, autenticação | Supabase Auth |
| Número de telefone | Sim | Não | Funcionalidade do app (contato entre clube/atleta) | `profile.phone` |
| Endereço (cidade/estado) | Sim | Não | Funcionalidade do app | `profile.city`, `profile.state` |
| ID de usuário | Sim | Não | Funcionalidade do app | `profile.id` (UUID) |
| Fotos | Sim | Não | Funcionalidade do app | avatar |
| Vídeos | Sim | Não | Funcionalidade do app | vídeos de atleta |
| Outros arquivos do usuário | Sim | Não | Verificação profissional | documentos de credencial |
| Informações de saúde e condicionamento físico | Sim | Não | Funcionalidade do app (avaliação esportiva) | `validation.checklist` (composição corporal, exames, testes físicos, odontologia, psicologia) |
| Outras ações no app | Sim | Não | Estatísticas de perfil | contagem de vídeos/validações/contatos |

Marque:
- **"Os dados são criptografados em trânsito?"** → Sim (HTTPS/TLS via Supabase).
- **"Você oferece uma forma de o usuário solicitar a exclusão dos dados?"** → Sim → informe a URL de `/exclusao-de-conta` e confirme que existe exclusão de conta dentro do app (Configurações → Excluir conta).
- **Compartilhamento com terceiros** → Nenhum SDK de anúncio/analytics; apenas processamento pelo Supabase (infraestrutura) — normalmente não conta como "compartilhamento" para fins de anúncio/marketing, apenas como processamento de dados terceirizado. Declare o Supabase como provedor de serviço, não como parceiro de compartilhamento de dados para publicidade.
- **Não há**: localização precisa/aproximada, contatos do dispositivo, histórico de navegação, identificadores de publicidade, dados financeiros.

## 3. Apple App Store Connect

### 3.1 Privacy Policy URL
App Store Connect → **App Information → Privacy Policy URL** → `/privacidade`.

### 3.2 Support URL
App Store Connect → **App Information → Support URL** → `/suporte`.
Confirmado que a página:
- Identifica claramente o app (nome + bundle ID)
- Tem contato por e-mail (`casafortefc@gmail.com`)
- Não é rede social, não redireciona para a store, não tem senha

### 3.3 App Privacy (Nutrition Labels)
App Store Connect → **App Privacy**. Mapeamento por categoria Apple:

| Categoria Apple | Coletado | Vinculado à identidade | Usado para rastreamento |
|---|---|---|---|
| Contact Info (Name, Email, Phone Number) | Sim | Sim | Não |
| Physical Address (City/State) | Sim | Sim | Não |
| Health & Fitness | Sim | Sim | Não |
| User Content (Photos, Videos) | Sim | Sim | Não |
| Identifiers (User ID) | Sim | Sim | Não |
| Other Data (documentos profissionais) | Sim | Sim | Não |

Para cada item, finalidade declarada: **App Functionality** (funcionalidade do app). Nenhum dado é usado para **Analytics**, **Advertising**, ou **Third-Party Advertising**.

### 3.4 App Tracking Transparency (ATT)
Não aplicável — o app não rastreia usuários entre apps/sites de terceiros para publicidade (confirmado: nenhum SDK de ads/attribution no código). Não é necessário exibir o prompt de ATT nem incluir a `NSUserTrackingUsageDescription`.

### 3.5 Link dentro do app
A Apple exige um link de Política de Privacidade acessível de dentro do app. Já implementado em **Perfil → Configurações**, junto com Termos de Uso e Suporte.

## 4. O que já foi implementado neste PR

- Site `/legal` com Política de Privacidade, Termos de Uso, Suporte e Exclusão de Conta.
- Exclusão de conta real (Configurações → Excluir conta), via RPC `cffc_delete_own_account` (migration `supabase/migrations/20260731120000_delete_own_account_rpc.sql`), que remove linhas de todas as tabelas do usuário, arquivos no Storage e o usuário de autenticação.
- Links de Política de Privacidade e Termos de Uso funcionais no cadastro (antes eram texto decorativo).
- Links de Política de Privacidade, Termos de Uso e Suporte em Configurações.

## 5. Pendências fora do escopo deste PR

- Publicar `/legal` na Vercel e atualizar as URLs (passo 0 acima).
- Preencher manualmente o Data Safety Form (Play Console) e o App Privacy (App Store Connect) — são formulários nas respectivas consoles, não há API para automatizar.
- Capturas de tela e metadados de listagem da loja (ícones, descrição, categoria).
- Testar o fluxo de exclusão de conta em um ambiente de homologação do Supabase antes de liberar em produção, já que a função remove dados de forma irreversível.
