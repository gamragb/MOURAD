export interface AIAnalysis {
  predictions: {
    productName: string;
    prediction: string;
    urgency: 'high' | 'medium' | 'low';
  }[];
  suggestions: string[];
  summary: string;
}

export async function analyzeStoreData(token: string | null, products: any[], sales: any[]): Promise<AIAnalysis> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers,
      body: JSON.stringify({ products, sales }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.error === "API_KEY_MISSING") {
        throw new Error("API_KEY_MISSING");
      }
      throw new Error(errData.message || "Failed to analyze data on server.");
    }

    return await response.json();
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    if (error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw new Error(error.message || "Failed to communicate with AI Assistant.");
  }
}
