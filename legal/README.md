# cffc-legal

Site estático (Next.js App Router) com a Política de Privacidade, os Termos
de Uso, a página de Suporte e a página de Exclusão de Conta e Dados do app
Big Eye Scout. Serve os requisitos obrigatórios de publicação na Google Play
e na Apple App Store.

## Rodando localmente

```bash
cd legal
npm install
npm run dev
```

## Deploy na Vercel

Este projeto vive em uma subpasta do monorepo `cffc-app`, então no dashboard
da Vercel, ao importar o repositório:

1. **Root Directory**: `legal`
2. Framework Preset: Next.js (detectado automaticamente)
3. Build Command / Output: padrão do Next.js

Depois do primeiro deploy, atualize `lib/site.ts` com o domínio real
(`SITE_URL`) e, se aplicável, configure um domínio customizado no projeto da
Vercel. Depois de trocar o domínio, atualize também
`src/constants/legal.ts` no app Expo para apontar para as URLs finais — os
checkboxes de Termos/Privacidade no cadastro do app usam essas URLs.

## Páginas

| Rota | Uso |
|---|---|
| `/privacy` | Privacy Policy — obrigatória na Google Play e na App Store |
| `/terms` | Terms of Use |
| `/support` | Support URL — obrigatória na App Store Connect |
| `/exclusao-de-conta` | Account & data deletion — referenciada no Data Safety Form da Google Play |

## Idiomas (pt-BR / en / ja)

O site tem suporte às 3 línguas do app (`src/locales/en.ts`, `pt-br.ts`,
`ja.ts`). A implementação usa um segmento dinâmico `app/[locale]/...`:

- `/en/...` e `/ja/...` servem conteúdo em inglês e japonês.
- As URLs sem prefixo (`/support`, `/privacy`, `/terms`,
  `/exclusao-de-conta`) continuam funcionando sem mudança — são as URLs
  usadas em `src/constants/legal.ts` (e as que devem ser registradas no
  App Store Connect / Google Play). O `middleware.ts` reescreve essas
  rotas internamente para `/pt-br/...` sem alterar a URL visível.

O texto de cada página vive em `content/<página>/<locale>.tsx` (um
componente por idioma, sem biblioteca de i18n) e as rotas em
`app/[locale]/<página>/page.tsx` apenas escolhem o componente certo pelo
`locale`. Strings de UI compartilhadas (nav, títulos, data de
"última atualização") ficam em `lib/i18n.ts`.

Para adicionar conteúdo a uma página existente, edite os três arquivos em
`content/<página>/` (`pt-br.tsx`, `en.tsx`, `ja.tsx`) mantendo o mesmo
conteúdo nos três idiomas.
