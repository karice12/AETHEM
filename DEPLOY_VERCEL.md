# Deploy do AETHEM na Vercel

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Repositório do projeto no GitHub

## Passo a Passo

### 1. Conectar o Repositório

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Selecione o repositório do AETHEM no GitHub
4. Clique em **"Import"**

### 2. Configurar o Projeto

Na tela de configuração, a Vercel detecta automaticamente as configurações via `vercel.json`. Verifique:

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3. Configurar as Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione as seguintes chaves antes de fazer o deploy:

| Nome | Descrição | Obrigatória |
|---|---|---|
| `GEMINI_API_KEY` | Chave da API Google Gemini | Para IA funcionar |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe (`sk_...`) | Para pagamentos |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe (`pk_...`) | Para checkout no frontend |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe (`whsec_...`) | Para eventos de pagamento |
| `APP_URL` | URL da sua aplicação na Vercel (ex: `https://aethem.vercel.app`) | Para redirecionamentos |

> ⚠️ **Atenção:** Sem essas chaves, o servidor inicia normalmente, mas as funcionalidades de IA e pagamento retornam erros amigáveis.

### 4. Fazer o Deploy

Clique em **"Deploy"**. A Vercel irá:
1. Instalar as dependências (`npm install`)
2. Buildar o frontend (`npm run build` → gera a pasta `dist/`)
3. Subir as funções serverless da pasta `api/`
4. Servir o `dist/` como estáticos e rotear `/api/*` para o backend Express

### 5. Configurar o Webhook do Stripe (pós-deploy)

Após o deploy, configure o webhook no painel do Stripe:

1. Acesse [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **"Add endpoint"**
3. URL do endpoint: `https://sua-url.vercel.app/api/payments/webhook`
4. Eventos a escutar: `checkout.session.completed`
5. Copie o **Signing secret** e salve como `STRIPE_WEBHOOK_SECRET` nas variáveis da Vercel

### 6. Atualizar a Variável `APP_URL`

Após o primeiro deploy, copie a URL gerada pela Vercel e atualize a variável `APP_URL` nas configurações do projeto. Faça um novo deploy para aplicar.

## Estrutura de Roteamento na Vercel

```
/api/*          → api/index.ts  (Express serverless)
/               → dist/index.html (React SPA)
/dashboard      → dist/index.html (React Router cuida do roteamento)
```

## Atualizar o Deploy

Qualquer push para a branch `main` do GitHub dispara um novo deploy automático na Vercel.
