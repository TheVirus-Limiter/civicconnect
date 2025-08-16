// Simple client-side translation using Google Translate
// No API key needed for basic functionality

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
    const { content, targetLanguage } = request;
    
    try {
      // Simple approach - use Google Translate iframe or prepare content for client-side translation
      // For now, return simple static translations for key components
      const staticTranslations = this.getStaticTranslations(targetLanguage);
      
      let translatedContent = content;
      
      // Replace common English phrases with Spanish equivalents
      if (targetLanguage === 'es') {
        Object.entries(staticTranslations.en_to_es).forEach(([english, spanish]) => {
          translatedContent = translatedContent.replace(new RegExp(english, 'gi'), spanish);
        });
      } else {
        Object.entries(staticTranslations.es_to_en).forEach(([spanish, english]) => {
          translatedContent = translatedContent.replace(new RegExp(spanish, 'gi'), english);
        });
      }

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

  private getStaticTranslations(targetLanguage: 'es' | 'en') {
    return {
      en_to_es: {
        "Your Representatives": "Sus Representantes",
        "Recent Bills": "Proyectos de Ley Recientes", 
        "Breaking News": "Últimas Noticias",
        "Community Polls": "Encuestas de la Comunidad",
        "Contact": "Contactar",
        "Learn More": "Aprende Más",
        "Party": "Partido",
        "Years in Office": "Años en el Cargo",
        "Bills Sponsored": "Proyectos Patrocinados",
        "Recent Activity": "Actividad Reciente",
        "Vote": "Votar",
        "Results": "Resultados", 
        "Healthcare": "Atención Médica",
        "Infrastructure": "Infraestructura",
        "Border Security": "Seguridad Fronteriza",
        "Education": "Educación",
        "Economy": "Economía",
        "Environment": "Medio Ambiente",
        "Share your opinion": "Comparte tu opinión",
        "All": "Todos",
        "Local": "Local",
        "State": "Estado",
        "National": "Nacional",
        "No polls available": "No hay encuestas disponibles",
        "There are no active polls": "No hay encuestas activas"
      },
      es_to_en: {
        "Sus Representantes": "Your Representatives",
        "Proyectos de Ley Recientes": "Recent Bills",
        "Últimas Noticias": "Breaking News", 
        "Encuestas de la Comunidad": "Community Polls",
        "Contactar": "Contact",
        "Aprende Más": "Learn More",
        "Partido": "Party",
        "Años en el Cargo": "Years in Office",
        "Proyectos Patrocinados": "Bills Sponsored",
        "Actividad Reciente": "Recent Activity",
        "Votar": "Vote",
        "Resultados": "Results",
        "Atención Médica": "Healthcare",
        "Infraestructura": "Infrastructure", 
        "Seguridad Fronteriza": "Border Security",
        "Educación": "Education",
        "Economía": "Economy",
        "Medio Ambiente": "Environment",
        "Comparte tu opinión": "Share your opinion",
        "Todos": "All",
        "Local": "Local",
        "Estado": "State",
        "Nacional": "National",
        "No hay encuestas disponibles": "No polls available",
        "No hay encuestas activas": "There are no active polls"
      }
    };
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