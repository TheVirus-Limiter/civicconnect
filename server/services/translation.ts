import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranslationRequest {
  content: string;
  targetLanguage: 'es' | 'en';
  context?: string;
}

export interface TranslationResponse {
  translatedContent: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export class TranslationService {
  async translatePageContent(request: TranslationRequest): Promise<TranslationResponse> {
    const { content, targetLanguage, context = "civic engagement website" } = request;
    
    try {
      const prompt = `You are a professional translator specializing in civic and government content. 
      
Translate the following ${targetLanguage === 'es' ? 'English to Spanish' : 'Spanish to English'} content while:
1. Maintaining all HTML structure and formatting exactly
2. Preserving technical terms and proper nouns appropriately
3. Using formal, respectful language appropriate for civic engagement
4. Keeping government titles and official positions accurate
5. Maintaining any numbers, dates, and data exactly as provided

Context: ${context}

Content to translate:
${content}

Return only the translated content, maintaining exact formatting and structure.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Return only the translated content, preserving all formatting and structure exactly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent translations
        max_tokens: 4000,
      });

      const translatedContent = response.choices[0].message.content || content;

      return {
        translatedContent,
        sourceLanguage: targetLanguage === 'es' ? 'en' : 'es',
        targetLanguage,
      };
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error("Failed to translate content");
    }
  }

  async translateBulkContent(items: Array<{id: string, content: string}>, targetLanguage: 'es' | 'en'): Promise<Array<{id: string, translatedContent: string}>> {
    const results = [];
    
    // Process in batches to avoid rate limits
    for (const item of items) {
      try {
        const result = await this.translatePageContent({
          content: item.content,
          targetLanguage,
          context: "civic engagement platform content"
        });
        
        results.push({
          id: item.id,
          translatedContent: result.translatedContent
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Translation failed for item ${item.id}:`, error);
        results.push({
          id: item.id,
          translatedContent: item.content // Fallback to original
        });
      }
    }
    
    return results;
  }
}

export const translationService = new TranslationService();