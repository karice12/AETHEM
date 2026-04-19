import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();

// Initialize Mercado Pago
if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.log("Mercado Pago Token detected (ends with:", process.env.MERCADO_PAGO_ACCESS_TOKEN.slice(-4), ")");
} else {
  console.warn("Mercado Pago Token is MISSING. Checkout will not work.");
}

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' 
});

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (err) {
    console.error("Firebase Admin Init Error:", err);
  }
}

const db = admin.firestore();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Subscription Middleware
  const checkSubscription = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Acesso Neural Negado: Token Ausente." });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData) {
        return res.status(404).json({ error: "Operador não registrado no Kernel." });
      }

      // Check for active subscription and not expired
      const expiresAt = userData.expiresAt?.toDate ? userData.expiresAt.toDate() : (userData.expiresAt ? new Date(userData.expiresAt) : null);
      const isSubscribed = userData.subscriptionStatus === 'active' && expiresAt && expiresAt > new Date();

      if (!isSubscribed) {
        return res.status(403).json({ error: "Assinatura Inativa: Upgrade necessário para acesso total ao Kernel." });
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res.status(401).json({ error: "Sessão Neural Expirada." });
    }
  };

  // Google AI Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes (Protected by Subscription)
  app.post("/api/gemini/discovery", checkSubscription, async (req, res) => {
    try {
      const { idea, category } = req.body;
      const prompt = `Você é um engenheiro de prompts veterano.
      O usuário tem esta ideia inicial: "${idea}" na categoria "${category}".
      Gere 3 perguntas de descoberta cirúrgicas e curtas para coletar mais contexto e transformar isso em um prompt de elite.
      Retorne APENAS um JSON puro no formato: {"questions": ["q1", "q2", "q3"]}`;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      const text = (result.text || "").replace(/```json|```/g, "").trim();
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Discovery Error:", error);
      res.status(500).json({ error: "Falha na análise neural." });
    }
  });

  app.post("/api/gemini/forge", checkSubscription, async (req, res) => {
    try {
      const { idea, category, destination, answers } = req.body;
      const context = Object.entries(answers)
        .map(([q, a]) => `Pergunta: ${q}\nResposta: ${a}`)
        .join("\n");

      const prompt = `AJA como um Engenheiro de Prompt Sênior nível Vale do Silício.
      OBJETIVO: Criar o prompt definitivo (ELITE PROMPT).
      
      CONTEXTO:
      - Ideia Base: ${idea}
      - Categoria: ${category}
      - Destino Final: ${destination}
      - Detalhes Coletados:
      ${context}

      DIRETRIZES DE FORJA:
      1. Use frameworks conhecidos (Role, Mission, Constraints, Context).
      2. O prompt deve ser altamente específico e otimizado para o ${destination}.
      3. Use linguagem técnica e comandos de sistema.
      
      SAÍDA: Retorne APENAS o prompt final pronto para ser colado em um LLM. Sem explicações extras.`;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      res.json({ prompt: result.text || "" });
    } catch (error) {
      console.error("Forge Error:", error);
      res.status(500).json({ error: "Falha na transmissão nuclear." });
    }
  });

  // Mercado Pago Checkout
  app.post("/api/payments/create-preference", async (req, res) => {
    try {
      const { plan, userId, email } = req.body;
      
      if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        console.error("MERCADO_PAGO_ACCESS_TOKEN is missing");
        return res.status(500).json({ error: "Configuração de pagamento ausente (Token)." });
      }

      if (!process.env.APP_URL) {
        console.error("APP_URL is missing");
        return res.status(500).json({ error: "Configuração do servidor ausente (URL)." });
      }

      const amount = plan === 'monthly' ? 49.90 : 299.90;
      const title = plan === 'monthly' ? 'AETHEM - Elite Monthly' : 'AETHEM - Overlord Yearly';

      const preference = new Preference(mpClient);
      const result = await preference.create({
        body: {
          items: [
            {
              id: plan,
              title: title,
              unit_price: amount,
              quantity: 1,
              currency_id: 'BRL'
            }
          ],
          payer: {
            email: email || 'usuario@forja.aethem.com' // Fallback se o email for nulo
          },
          external_reference: userId, 
          back_urls: {
            success: `${process.env.APP_URL}/dashboard?payment=success`,
            failure: `${process.env.APP_URL}/dashboard?payment=failure`,
            pending: `${process.env.APP_URL}/dashboard?payment=pending`
          },
          auto_return: 'approved',
          notification_url: `${process.env.APP_URL}/api/payments/webhook`
        }
      });

      res.json({ id: result.id, init_point: result.init_point });
    } catch (error: any) {
      // Tentar extrair o erro específico do Mercado Pago se disponível
      const mpError = error.response || error;
      
      console.error("MP Preference Error Detailed:", JSON.stringify(mpError, null, 2));

      let userFriendlyMessage = "Falha ao gerar link de pagamento.";
      
      if (error.message?.includes("authentication")) {
        userFriendlyMessage = "Erro de autenticação no Mercado Pago. Verifique seu Access Token.";
      } else if (error.message?.includes("parameter")) {
        userFriendlyMessage = "Erro nos parâmetros do pagamento. Contate o suporte.";
      }

      res.status(500).json({ 
        error: userFriendlyMessage,
        details: error.message,
        mp_details: error.response?.data || null
      });
    }
  });

  // Mercado Pago Webhook
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const { type, data } = req.query;
      
      if (type === 'payment') {
        const paymentId = data as string;
        
        // Fetch payment details from MP
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` }
        });
        const paymentData = await response.json();

        if (paymentData.status === 'approved') {
          const userId = paymentData.external_reference;
          const plan = paymentData.additional_info.items[0].id;
          
          const now = new Date();
          const expiresAt = new Date();
          if (plan === 'monthly') expiresAt.setMonth(now.getMonth() + 1);
          else expiresAt.setFullYear(now.getFullYear() + 1);

          // Update user in Firestore
          await db.collection('users').doc(userId).set({
            plan,
            subscriptionStatus: 'active',
            expiresAt: expiresAt,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          console.log(`Assinatura ativada para usuário: ${userId}`);
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook Error:", error);
      res.sendStatus(500);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Master Control running on http://localhost:${PORT}`);
  });
}

startServer();
