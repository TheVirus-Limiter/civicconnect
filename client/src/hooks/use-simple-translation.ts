import { useState, useCallback } from "react";

export type Language = "en" | "es";

const translations = {
  // Page sections
  "Your Representatives": "Sus Representantes",
  "Recent Bills": "Proyectos de Ley Recientes",
  "Breaking News": "Últimas Noticias", 
  "Community Polls": "Encuestas de la Comunidad",
  
  // UI Elements
  "Contact": "Contactar",
  "Learn More": "Aprende Más",
  "Party": "Partido",
  "Years in Office": "Años en el Cargo",
  "Bills Sponsored": "Proyectos Patrocinados",
  "Recent Activity": "Actividad Reciente",
  "Vote": "Votar",
  "Results": "Resultados",
  
  // Categories
  "Healthcare": "Atención Médica",
  "Infrastructure": "Infraestructura",
  "Border Security": "Seguridad Fronteriza",
  "Education": "Educación",
  "Economy": "Economía",
  "Environment": "Medio Ambiente",
  
  // Poll content
  "Share your opinion": "Comparte tu opinión",
  "All": "Todos",
  "Local": "Local",  
  "State": "Estado",
  "National": "Nacional",
  "No polls available": "No hay encuestas disponibles",
  "There are no active polls": "No hay encuestas activas",
  
  // Legislator content
  "Representative": "Representante",
  "Senator": "Senador",
  "Republican": "Republicano",
  "Democrat": "Demócrata",
  "Independent": "Independiente",
  
  // News content
  "Read More": "Leer Más",
  "Published": "Publicado",
  "Source": "Fuente",
  
  // Bill content
  "Introduced": "Introducido",
  "Status": "Estado",
  "Summary": "Resumen",
  "Sponsor": "Patrocinador"
};

export function useSimpleTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("preferredLanguage");
    return (saved as Language) || "en";
  });

  const translateText = useCallback((text: string, targetLanguage: Language = currentLanguage): string => {
    if (targetLanguage === "en") return text;
    
    // Simple text replacement for Spanish
    let translated = text;
    Object.entries(translations).forEach(([english, spanish]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, spanish);
    });
    
    return translated;
  }, [currentLanguage]);

  const toggleLanguage = useCallback(() => {
    const newLanguage = currentLanguage === "en" ? "es" : "en";
    setCurrentLanguage(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
    
    // Trigger a page re-render by updating a data attribute
    document.documentElement.setAttribute('data-language', newLanguage);
    
    // Dispatch a custom event for components to listen to
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language: newLanguage } 
    }));
  }, [currentLanguage]);

  return {
    currentLanguage,
    translateText,
    toggleLanguage,
    t: translateText
  };
}