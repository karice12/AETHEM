import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from 'stripe';

dotenv.config();

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

if (process.env.STRIPE_SECRET_KEY) {
  console.log("Stripe Secret Key detected.");
} else {
  console.warn("Stripe Secret Key is MISSING. Checkout will not work.");
}

// Initialize Firebase Admin
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 5000;

  // Stripe Webhook MUST stay before express.json() to receive raw body for signature verification
  app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), async (req: any, res: any) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    console.log("Stripe Webhook Received. Signature:", sig ? "Present" : "Missing");

    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured." });
    }

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Webhook Event Validated:", event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id as string;
      const plan = session.metadata?.plan as string;
      
      console.log(`Processing completion for User: ${userId}, Plan: ${plan}`);

      const now = new Date();
      const expiresAt = new Date();
      if (plan === 'monthly') expiresAt.setMonth(now.getMonth() + 1);
      else expiresAt.setFullYear(now.getFullYear() + 1);

      try {
        // Update user in Firestore
        await db.collection('users').doc(userId).set({
          plan,
          subscriptionStatus: 'active',
          expiresAt: expiresAt,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✅ Assinatura Stripe ATIVADA para: ${userId} (${plan})`);
      } catch (dbError) {
        console.error("Firestore Update Error in Webhook:", dbError);
      }
    }

    res.json({ received: true });
  });

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

  // Stripe Checkout
  app.post("/api/payments/create-session", async (req, res) => {
    try {
      const { plan, userId, email } = req.body;
      
      if (!stripe) {
        console.error("STRIPE_SECRET_KEY is missing");
        return res.status(500).json({ error: "Funcionalidade de pagamento requer a configuração da chave STRIPE_SECRET_KEY no ambiente." });
      }

      if (!process.env.APP_URL) {
        console.error("APP_URL is missing");
        return res.status(500).json({ error: "Configuração do servidor ausente (URL)." });
      }

      const amount = plan === 'monthly' ? 4990 : 29990; // Em centavos
      const title = plan === 'monthly' ? 'AETHEM - Elite Monthly' : 'AETHEM - Overlord Yearly';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: title,
                description: `Acesso Neural AETHEM - Plano ${plan === 'monthly' ? 'Mensal' : 'Anual'}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: email,
        client_reference_id: userId,
        success_url: `${process.env.APP_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.APP_URL}/dashboard?payment=failure`,
        metadata: {
          plan,
          userId
        }
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Session Error:", error);
      res.status(500).json({ 
        error: "Falha ao gerar link de pagamento Stripe.",
        details: error.message
      });
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
