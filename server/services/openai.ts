import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key",
});

export interface BillSummary {
  summary: string;
  keyProvisions: string[];
  potentialImpact: string;
  readingLevel: string;
}

export interface ChatResponse {
  response: string;
  confidence: number;
  sources: string[];
}

export async function summarizeBill(
  billText: string,
  language: "en" | "es" = "en"
): Promise<BillSummary> {
  const languagePrompt = language === "es" ? "Spanish" : "English";
  
  const prompt = `Summarize the following bill in simple, clear ${languagePrompt}, at a 9th-grade reading level, including:
1. Purpose
2. Key Provisions  
3. Potential Impact

Return the response as JSON in this format:
{
  "summary": "Brief overview of the bill",
  "keyProvisions": ["provision 1", "provision 2", "provision 3"],
  "potentialImpact": "How this affects citizens",
  "readingLevel": "9th grade"
}

Bill text:
${billText}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in translating complex legislation into simple, accessible language for citizens.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as BillSummary;
  } catch (error) {
    throw new Error("Failed to summarize bill: " + (error as Error).message);
  }
}

export async function chatWithCivica(
  message: string,
  context: string = "",
  language: "en" | "es" = "en"
): Promise<ChatResponse> {
  const languagePrompt = language === "es" ? "Spanish" : "English";
  
  const systemPrompt = `You are Civica, an AI assistant helping citizens understand legislation and civic processes. 
  
  Your role:
  - Explain bills, laws, and civic processes in simple terms
  - Provide accurate, non-partisan information
  - Help users understand how government works
  - Always cite your sources when referencing specific bills or data
  - Respond in ${languagePrompt}
  - Keep responses at a 9th-grade reading level
  
  Context: ${context}
  
  Always respond in JSON format:
  {
    "response": "Your helpful response",
    "confidence": 0.95,
    "sources": ["source1", "source2"]
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ChatResponse;
  } catch (error) {
    throw new Error("Failed to get chat response: " + (error as Error).message);
  }
}

export async function translateText(
  text: string,
  targetLanguage: "en" | "es"
): Promise<string> {
  const languageMap = {
    en: "English",
    es: "Spanish"
  };

  const prompt = `Translate the following text to ${languageMap[targetLanguage]}. 
  Maintain the same tone and meaning. Return only the translated text:
  
  ${text}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional translator specializing in civic and political content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text; // Return original text if translation fails
  }
}

export async function generateContactTemplate(
  billTitle: string,
  userPosition: "support" | "oppose",
  language: "en" | "es" = "en"
): Promise<string> {
  const languagePrompt = language === "es" ? "Spanish" : "English";
  const positionText = userPosition === "support" ? "support" : "oppose";

  const prompt = `Generate a professional email template for a constituent to contact their representative about a bill. 
  
  Requirements:
  - Write in ${languagePrompt}
  - Express ${positionText} for: ${billTitle}
  - Professional but personal tone
  - Include placeholders for [Representative Name], [Your Name], [Your Address]
  - About 150-200 words
  - Include specific reasons and impact on constituents
  
  Return only the email template text.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in civic engagement and constituent communication.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    throw new Error("Failed to generate contact template: " + (error as Error).message);
  }
}
