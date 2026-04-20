# AETHEM - AI Prompt Engineering Platform

## Overview
AETHEM é uma plataforma de engenharia de prompts com IA que ajuda usuários a criar prompts elite para LLMs usando o Google Gemini. Possui modelo de assinatura, autenticação Firebase e UI com tema neural/cyberpunk.

## Tech Stack
- **Frontend:** React 19 + TypeScript, Tailwind CSS 4, Framer Motion, React Router DOM v7
- **Backend:** Express.js (Node.js) com TypeScript
- **AI:** Google Gemini (`@google/genai`)
- **Auth & DB:** Firebase (Auth + Firestore)
- **Payments:** Stripe
- **Build:** Vite 6 + tsx
- **Package Manager:** npm

## Arquitetura
- Servidor único (`server.ts`) rodando na **porta 5000**, servindo tanto a API Express quanto o middleware Vite em dev
- Em produção: serve a pasta compilada `dist/` como arquivos estáticos
- Rotas de API em `/api/gemini/*` (protegidas por middleware de assinatura) e `/api/payments/*`

## Estrutura do Projeto
```
├── server.ts                    # Servidor Express + Vite dev middleware (porta 5000)
├── vite.config.ts               # Vite config (allowedHosts: true para proxy Replit)
├── src/
│   ├── App.tsx                  # Roteamento e layout
│   ├── main.tsx                 # Ponto de entrada React
│   ├── pages/                   # Componentes de página
│   ├── context/                 # Contextos React (AuthContext)
│   ├── services/                # Camadas de serviço de API
│   └── lib/                    # Inicialização Firebase, utilitários
├── firebase-applet-config.json  # Configuração do projeto Firebase
└── .env.example                 # Variáveis de ambiente necessárias
```

## Variáveis de Ambiente Necessárias
> ⚠️ O servidor inicia mesmo sem essas chaves, mas as funcionalidades correspondentes ficam desativadas.

| Variável | Descrição | Obrigatória para |
|---|---|---|
| `GEMINI_API_KEY` | Chave da API Google Gemini | Geração de prompts com IA |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe (frontend) | Checkout de pagamentos |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe (backend) | Checkout de pagamentos |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe | Processar eventos de pagamento |
| `APP_URL` | URL da aplicação em produção | Redirecionamentos do Stripe |

## Inicialização

```bash
# Desenvolvimento (servidor na porta 5000)
npm run dev

# Build do frontend para dist/
npm run build
```

## Deploy / Produção
- **Target:** autoscale
- **Build:** `npm run build` → gera `dist/`
- **Run:** `npx tsx server.ts`
- **Porta:** 5000
- O `server.ts` detecta `NODE_ENV=production` e serve a pasta `dist/` como estáticos

## Comportamento sem Chaves de API
- **Sem `STRIPE_SECRET_KEY`:** Servidor inicia normalmente; rotas `/api/payments/*` retornam erro 500 amigável
- **Sem `GEMINI_API_KEY`:** Servidor inicia normalmente; rotas `/api/gemini/*` falham na chamada à API
- **Sem `APP_URL`:** Rota de criação de sessão Stripe retorna erro 500

## Configurações Importantes
- Vite configurado com `allowedHosts: true` para compatibilidade com o proxy do Replit
- Servidor Express escuta em `0.0.0.0:5000`
- Firebase Admin inicializado via `firebase-applet-config.json`
- Stripe é inicializado de forma nullable — sem crash ao iniciar sem a chave
