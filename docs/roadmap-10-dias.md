# Roadmap — 10 dias (3 devs avançados + Claude)

> Este documento registra a análise feita sobre o estado atual do CFFC/Big Eye
> (app mobile + Admin Hub) e o roadmap de 10 dias combinado a partir dela.
> Será alimentado/atualizado conforme o trabalho avança.

## O produto

Três pilares (tagline do app): **"The platform that connects athletes,
professionals, and football clubs."**

- **Atleta** — sobe vídeos, mantém perfil (medidas, posições, pontos fortes,
  histórico de clubes em texto livre), aparece em buscas.
- **Profissional** (olheiro/técnico, credenciado via CRM/CREF) — busca
  atletas e emite **validações técnicas** (avaliação físico-desportiva
  detalhada: antropometria, bioimpedância, dinamometria, bioquímica, VO2max,
  Yo-yo, shuttle run, Wingate, RAST, força/potência, velocidade, agilidade,
  flexibilidade, ACWR, odontologia, psicologia).
- **Clube** — busca atletas, monta shortlist, tenta contato.
- **Admin** (Admin Hub, app web separado) — modera denúncias, vídeos,
  validação profissional e usuários.

## Estado atual — mapeado

### App mobile (`cffc`)

- Auth: login/signup com seleção de role, Google/Apple Sign-In, recuperação
  de senha, exclusão de conta real (RPC), i18n (en/pt-br/ja), tema.
- Atleta: feed de vídeos aprovados, upload de vídeo (+thumb, vai para
  moderação), perfil editável rico, stats (vídeos/validações/contatos
  aprovados).
- Profissional: perfil com credenciais, upload de documento verificador,
  `reputation_score` (sem mecanismo visível que o alimente), histórico de
  validações emitidas, busca de atletas com filtros.
- Clube: mesma busca/filtros, shortlist (favoritos), "contato" via `Share`/
  `tel:` nativo (WhatsApp/SMS) — **não é chat in-app**.
- Moderação/confiança: `user_block` (só insert), `content_report` (denúncia
  com motivo), `banned_until`.

### Admin Hub (web, separado)

4 seções: Denúncias, Vídeos em Análise, Validação Profissional, Gestão de
Usuários (bloquear/desbloquear, remover selo, criar admin, histórico de
auditoria `adm_log`) + toggle de auto-moderação de mídia. Sem
dashboard/analytics.

### Lacunas confirmadas no schema (grep nas migrations dos dois projetos)

Não existe nenhuma tabela de chat/mensagem, notificação, follow, like ou
comentário — são lacunas reais de produto, não só de UI.

## Análise — o que falta (ótica de "rede social")

1. **Sem mensageria in-app** — contato clube→atleta expõe telefone direto via
   share nativo. Risco de privacidade/segurança para atletas de base
   (potencialmente menores).
2. **Sem grafo de "seguir"** — só existe `club_shortlist` (lista privada do
   clube). Feed é global e cronológico, sem personalização por relação.
3. **Zero interação social no conteúdo** — feed de vídeos sem like, comentário
   ou reação.
4. **Sem notificações** — nenhum push/in-app para validação recebida, vídeo
   moderado, pedido de contato, etc.
5. **Clube é só um profile com role, não uma entidade** — sem página oficial
   de clube, sem vínculo institucional verificado (histórico de clube é texto
   livre digitado pelo próprio atleta).
6. **Busca é unidirecional** — só pro/clube buscam atleta. Atleta não
   descobre/segue clubes ou profissionais.
7. **Sem "oportunidades"** — nada de peneiras, testes abertos, convocações.
8. **Validação é uma via só** — atleta não reage, não solicita validação a um
   profissional específico; clube não comenta.
9. **`reputation_score` sem origem visível** — campo existe, mas nada no
   código o calcula.
10. **Admin Hub sem dashboard/analytics** e sem ferramenta de
    comunicado/broadcast para usuários.

## Lacunas de completude confirmadas no código (as que doem *agora*)

Estas são as prioritárias — funcionalidades que já existem mas estão pela
metade, com o schema/RLS já pronto na maioria dos casos.

| # | Gap | Evidência |
|---|---|---|
| 1 | **Atleta não consegue excluir o próprio vídeo** | `deleteMedia` só existe no Admin Hub (`cffc-admin-hub/src/processes/media.ts`); nada equivalente no app. |
| 2 | **Rejeição é muda** — vídeo, documento profissional e validação são aprovados/rejeitados sem campo de motivo | Nenhuma coluna `reason`/`rejection_reason` em `media`, `professional_document` ou `validation`. |
| 3 | **`contact_request` existe no schema mas nunca é usado pelo app** | Migration `20260228000000_validation_shortlist_contact.sql` já define `contact_request_status` (pending/accepted/declined), `contact_request_accepted_by` (athlete/guardian), `guardian_email` em `profile`, e RLS completa (insert pelo clube, update por clube ou atleta). Nenhum código do app cria ou atualiza linhas nessa tabela — hoje o telefone sai direto via `Share`/`tel:` no Favorites. Consequência: o stat `contactCount` do perfil é sempre 0. |
| 4 | **Sem "remover da shortlist"** | RLS `club_shortlist_delete` já existe; só existe `addToClubShortlist` no código, nenhum `removeFromClubShortlist`. |
| 5 | **Bloqueio sem desbloqueio** | `processes/moderation.ts` só tem `blockUser`/`fetchBlockedUserIds`, nenhum `unblockUser`. |
| 6 | **Sem editar/cancelar validação emitida** | RLS `validation_update` já permite o profissional dono atualizar; nenhuma função `updateValidation`/`deleteValidation` no app. |

## Priorização

- **P0 — inviável ficar sem**: itens 1, 2, 3, 4, 5 da tabela acima.
- **P1 — alta alavancagem, escopo contido**: central de notificações in-app
  (sem push nativo ainda), dashboard operacional no Admin Hub, editar/cancelar
  validação (item 6).
- **Fora de escopo (de propósito, não são "mudanças factíveis" em 10 dias)**:
  mensageria livre completa (chat), likes/comentários, grafo de seguir,
  páginas institucionais de clube, marketplace de oportunidades/peneiras,
  fluxo completo de aprovação por responsável legal via e-mail
  (`guardian_email` fica para depois — aceite do pedido de contato, por ora,
  é só pelo próprio atleta).

## Roadmap — 10 dias, 3 devs

| Dia | Dev A (Mobile — conteúdo próprio) | Dev B (Mobile — contact_request) | Dev C (Schema + Admin Hub) |
|---|---|---|---|
| 1–2 | Excluir vídeo próprio (função + confirm dialog + remoção otimista do perfil/feed) `(#1)` | Migration + RLS review de `contact_request`; mutation `createContactRequest`; botão "Pedir contato" na VisitorProfile | Migration: `rejection_reason` em `media`, `professional_document`, `validation`; campo de motivo no dialog de reject do Admin Hub `(#2)` |
| 3–4 | Remover da shortlist `(#4)` + tela "usuários bloqueados" com unblock `(#5)` | Tela do atleta "Pedidos de contato" (aceitar/recusar); ao aceitar, revela telefone ao clube (substitui o Share direto); estado refletido em Favorites do clube | Tabela `notification` + helper de insert + fiação nos pontos existentes (approve/reject de vídeo, documento, validação) |
| 5–6 | Central de notificações (sino, lista, badge, marcar como lida, deep link pro item) | Polimento contact_request: bloquear pedido duplicado, cancelar pedidos pendentes se houver block, i18n (en/pt-br/ja) | Dashboard de contadores no Admin Hub; exibir motivo de rejeição no app (Profile / ProProfile) |
| 7 | **Integração e QA cruzado**: upload → reject com motivo → atleta vê e reenvia; clube pede contato → atleta aceita → notificação nos dois lados → telefone liberado | | |
| 8–9 | Editar/cancelar validação emitida `(#6)` | Buffer para contact_request (maior incerteza do roadmap) | Ajuste fino do dashboard + novos tipos em `adm_log`; visão read-only de `contact_request` no Admin Hub (suporte) |
| 10 | **QA final** nos 3 papéis + admin, checagem de i18n nas 3 línguas, atualização pontual do `store-compliance.md` (fluxo de contato mudou), retro |

### Observações de execução

- **Item 3 (contact_request) é o de maior incerteza** — buffer nos dias 8–9
  de propósito nele. Se atrasar, é o único P0 que pode escorregar 1–2 dias
  sem quebrar o resto.
- **Guardian approval via e-mail** (`guardian_email`) fica deliberadamente de
  fora deste ciclo — aceite fica só pelo próprio atleta por enquanto. Registrar
  como próximo passo, não deixar cair do radar.
- **Push notification nativo** (expo-notifications) não entra neste ciclo — o
  app não tem essa dependência instalada hoje; seria a única mudança brusca
  de infraestrutura da lista, por isso ficou de fora.
- Todo item novo segue os padrões do projeto: hook pattern em `Views/`,
  strings nas 3 locales, chamadas Supabase só via `processes/`, sem `any`.

## Log de progresso

_(preencher conforme o trabalho avança)_

- [ ] #1 Excluir vídeo próprio
- [ ] #2 Motivo de rejeição (media / professional_document / validation)
- [ ] #3 Fluxo `contact_request` (pedido → aceite)
- [ ] #4 Remover da shortlist
- [ ] #5 Desbloquear usuário
- [ ] #6 Editar/cancelar validação emitida
- [ ] Central de notificações in-app
- [ ] Dashboard operacional no Admin Hub
