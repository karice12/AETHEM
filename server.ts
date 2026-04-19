import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

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
