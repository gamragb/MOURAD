import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { OAuth2Client } from "google-auth-library";

const oauthClient = new OAuth2Client();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));

  // Lazy-loaded Gemini Client helper
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  // API router to proxy Gemini analyze request securely on server-side
  app.post("/api/analyze", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "UNAUTHORIZED", message: "Missing or invalid token" });
      }

      const accessToken = authHeader.split("Bearer ")[1];
      try {
        const tokenInfo = await oauthClient.getTokenInfo(accessToken);
        if (!tokenInfo.email) {
          throw new Error("Invalid token scope");
        }
      } catch (err) {
        return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid or expired token" });
      }

      const { products, sales } = req.body;
      if (!products || !sales) {
        return res.status(400).json({ error: "Missing products or sales data" });
      }

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "API_KEY_MISSING",
          message: "الرجاء إعداد مفتاح GEMINI_API_KEY الخاص بك في إعدادات النظام لتتمكن من استخدام مستشار الذكاء الاصطناعي."
        });
      }

      const ai = getAiClient();

      const prompt = `
        As an AI Retail Expert, analyze the following POS data and provide strategic insights in JSON format.
        IMPORTANT: You MUST provide all strings (prediction, summary, suggestions) in ARABIC (الغة العربية).
        
        Current Inventory:
        ${JSON.stringify(products.map((p: any) => ({ name: p.name, qty: p.qty, minQty: p.minQty, supplier: p.supplier })))}
        
        Recent Sales (last 100):
        ${JSON.stringify(sales.map((s: any) => ({ 
          date: s.date, 
          items: s.items ? s.items.map((i: any) => ({ name: i.name, qty: i.qty })) : []
        })))}
        
        Provide:
        1. Predictions for products likely to run out soon based on current stock vs recent sales.
        2. Specific reorder suggestions (which supplier, any bulk buy advice).
        3. A brief strategic summary of sales performance.
        
        The response MUST follow this exact JSON schema:
        {
          "predictions": [{ "productName": "string", "prediction": "string", "urgency": "high|medium|low" }],
          "suggestions": ["string"],
          "summary": "string"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              predictions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productName: { type: Type.STRING },
                    prediction: { type: Type.STRING },
                    urgency: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
                  },
                  required: ["productName", "prediction", "urgency"]
                }
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              summary: { type: Type.STRING }
            },
            required: ["predictions", "suggestions", "summary"]
          }
        }
      });

      if (!response.text) {
        throw new Error("No response content from Gemini API");
      }

      const parsedResult = JSON.parse(response.text);
      return res.json(parsedResult);
    } catch (error: any) {
      console.error("Server AI Analysis Error:", error);
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: error.message || "فشلت عملية التحليل باستخدام الذكاء الاصطناعي."
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
