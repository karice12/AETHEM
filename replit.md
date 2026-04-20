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

## Estrutura do Projeto
```
├── server.ts                    # Dev/Replit: Express + Vite middleware (porta 5000)
├── api/
│   ├── app.ts                   # Express app com todas as rotas (sem Vite, sem listen)
│   └── index.ts                 # Vercel serverless entry point (re-exporta api/app.ts)
├── vercel.json                  # Configuração de deploy para Vercel
├── DEPLOY_VERCEL.md             # Guia de deploy na Vercel
├── vite.config.ts               # Vite config (allowedHosts: true para proxy Replit)
├── src/
│   ├── App.tsx                  # Roteamento e layout
│   ├── main.tsx                 # Ponto de entrada React
│   ├── pages/                   # Componentes de página
│   ├── context/                 # Contextos React (AuthContext)
│   ├── services/                # Camadas de serviço de API
│   └── lib/                     # Inicialização Firebase, utilitários
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
# Desenvolvimento no Replit (porta 5000)
npm run dev

# Build do frontend para dist/
npm run build
```

## Arquitetura de Deploy

### Replit (dev e produção)
- **Dev:** `tsx server.ts` → Express + Vite middleware na porta 5000
- **Prod:** `NODE_ENV=production npx tsx server.ts` → Express serve `dist/` como estáticos

### Vercel (serverless)
- **Build:** `npm run build` → gera `dist/`
- **Backend:** `api/index.ts` → função serverless Express
- **Frontend:** `dist/` servido como estáticos
- **Roteamento:** `vercel.json` redireciona `/api/*` → serverless, `/*` → `index.html`
- Ver `DEPLOY_VERCEL.md` para o passo a passo completo

## Comportamento sem Chaves de API
- **Sem `STRIPE_SECRET_KEY`:** Servidor inicia normalmente; rotas `/api/payments/*` retornam erro 500 amigável
- **Sem `GEMINI_API_KEY`:** Servidor inicia normalmente; rotas `/api/gemini/*` falham na chamada à API
- **Sem `APP_URL`:** Rota de criação de sessão Stripe retorna erro 500

## Configurações Importantes
- Vite configurado com `allowedHosts: true` para compatibilidade com o proxy do Replit
- Servidor Express escuta em `0.0.0.0:5000`
- Firebase Admin inicializado via `firebase-applet-config.json`
- Stripe e Gemini são inicializados de forma nullable — sem crash ao iniciar sem as chaves
