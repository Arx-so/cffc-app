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
| `/privacidade` | Privacy Policy — obrigatória na Google Play e na App Store |
| `/termos` | Terms of Use |
| `/suporte` | Support URL — obrigatória na App Store Connect |
| `/exclusao-de-conta` | Account & data deletion — referenciada no Data Safety Form da Google Play |
