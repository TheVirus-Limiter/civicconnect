import { useState, useCallback, useEffect } from "react";

export type Language = "en" | "es";

// Complete translation mappings for the entire site
const translations: Record<string, string> = {
  // Navigation
  "Recent Bills": "Proyectos de Ley Recientes",
  "Breaking News": "Últimas Noticias",
  "Your Representatives": "Sus Representantes", 
  "Community Polls": "Encuestas de la Comunidad",
  "Give Feedback": "Dar Comentarios",
  "Engage": "Participar",
  "Learn": "Aprender",
  
  // Hero section
  "Connected Civics": "Cívicos Conectados",
  "Your Voice in TX-23": "Tu Voz en TX-23",
  "Stay Connected to Your Democracy": "Manténgase Conectado a Su Democracia",
  "Track legislation, understand complex bills with AI assistance, and engage with your representatives—all in English and Spanish.": "Rastree la legislación, comprenda proyectos de ley complejos con asistencia de IA y participe con sus representantes, todo en inglés y español.",
  "Explore Bills": "Explorar Proyectos",
  "Learn How It Works": "Aprenda Cómo Funciona",
  
  // Bills section
  "Filter Bills": "Filtrar Proyectos",
  "Search bills...": "Buscar proyectos...",
  "Active": "Activo",
  "Passed": "Aprobado", 
  "Failed": "Fallido",
  "Category": "Categoría",
  "All Categories": "Todas las Categorías",
  "Jurisdiction": "Jurisdicción",
  "All Levels": "Todos los Niveles",
  "Federal": "Federal",
  "State": "Estatal",
  "Clear Filters": "Limpiar Filtros",
  "Most Recent": "Más Recientes",
  "PASSED HOUSE": "APROBADO EN CÁMARA",
  "IN COMMITTEE": "EN COMITÉ",
  "Bill Progress": "Progreso del Proyecto",
  "Ask AI": "Preguntar a IA",
  "Save": "Guardar",
  "Share": "Compartir",
  "View Details": "Ver Detalles",
  "Load More Bills": "Cargar Más Proyectos",
  
  // News section  
  "Civic News": "Noticias Cívicas",
  "Local": "Local",
  "National": "Nacional",
  "Explainer": "Explicativo",
  "BREAKING": "ÚLTIMA HORA",
  "Read More": "Leer Más",
  "More Info": "Más Información",
  
  // Representatives
  "Party": "Partido",
  "Republican": "Republicano",
  "Democrat": "Demócrata",
  "Years in Office": "Años en el Cargo",
  "Bills Sponsored": "Proyectos Patrocinados",
  "Recent Activity": "Actividad Reciente",
  "Contact": "Contactar",
  "Voted Yes on": "Votó Sí en",
  "Sponsored on": "Patrocinó",
  "No recent activity": "Sin actividad reciente",
  
  // Civic Education
  "Civic Education": "Educación Cívica",
  "How a Bill Becomes Law": "Cómo un Proyecto se Convierte en Ley",
  "Introduction": "Introducción",
  "Bill is introduced in House or Senate": "El proyecto se presenta en la Cámara o el Senado",
  "Committee Review": "Revisión del Comité",
  "Committee studies and marks up bill": "El comité estudia y marca el proyecto",
  "Floor Vote": "Votación General",
  "Full chamber debates and votes": "La cámara completa debate y vota",
  "Senate Vote": "Votación del Senado",
  "Senate debates and votes on the bill": "El Senado debate y vota sobre el proyecto",
  "Presidential Action": "Acción Presidencial",
  "President signs or vetoes the bill": "El presidente firma o veta el proyecto",
  "Watch Official Tutorial": "Ver Tutorial Oficial",
  "Test Your Knowledge": "Pon a Prueba tu Conocimiento",
  "Quick Quiz: Legislative Basics": "Cuestionario Rápido: Conceptos Básicos Legislativos",
  "How many votes are needed to override a presidential veto?": "¿Cuántos votos se necesitan para anular un veto presidencial?",
  "Simple Majority (51%)": "Mayoría Simple (51%)",
  "Two-Thirds Majority (67%)": "Mayoría de Dos Tercios (67%)",
  "Three-Quarters Majority (75%)": "Mayoría de Tres Cuartos (75%)",
  "Submit Answer": "Enviar Respuesta",
  "Take Full Quiz": "Tomar Cuestionario Completo",
  
  // Take Action
  "Take Action": "Tomar Acción",
  "Contact Your Reps": "Contacta a tus Representantes",
  "Generate personalized letters to your representatives about important legislation.": "Genera cartas personalizadas a tus representantes sobre legislación importante.",
  "Select a bill to discuss": "Selecciona un proyecto para discutir",
  "Generate Template": "Generar Plantilla",
  "Upcoming Events": "Próximos Eventos",
  "Find town halls, city council meetings, and other civic events in your area.": "Encuentra ayuntamientos, reuniones del consejo municipal y otros eventos cívicos en tu área.",
  "No upcoming events found": "No se encontraron eventos próximos",
  "Check back soon for new civic events": "Vuelve pronto para nuevos eventos cívicos",
  "View All Events": "Ver Todos los Eventos",
  "Voter Information": "Información del Votante",
  "Check your registration status, find polling locations, and get important voting dates.": "Verifica tu estado de registro, encuentra lugares de votación y obtén fechas importantes de votación.",
  "Next Election": "Próxima Elección",
  "days": "días",
  "Check Registration Status": "Verificar Estado de Registro",
  
  // AI Assistant
  "Meet Civica": "Conoce a Cívica",
  "Your AI assistant for understanding legislation": "Tu asistente de IA para entender la legislación",
  "Hello! I'm Civica, your AI assistant for understanding legislation. I can help explain bills, their impacts, and answer questions about the legislative process. What would you like to know?": "¡Hola! Soy Cívica, tu asistente de IA para entender la legislación. Puedo ayudar a explicar proyectos, sus impactos y responder preguntas sobre el proceso legislativo. ¿Qué te gustaría saber?",
  "Ask me anything about legislation...": "Pregúntame cualquier cosa sobre legislación...",
  "How does a bill become a law?": "¿Cómo se convierte un proyecto en ley?",
  "What's happening locally?": "¿Qué está pasando localmente?",
  "Explain a bill": "Explicar un proyecto",
  
  // Community
  "Join the Community": "Únete a la Comunidad",
  "Make your voice heard on important issues in TX-23": "Haz escuchar tu voz en temas importantes en TX-23",
  "Vote on local issues": "Vota en temas locales",
  "View Active Polls": "Ver Encuestas Activas",
  "Community Feedback": "Comentarios de la Comunidad",
  "Share your concerns": "Comparte tus preocupaciones",
  "Submit Feedback": "Enviar Comentarios",
  "Vote": "Votar",
  "Results": "Resultados",
  
  // Common terms
  "Status": "Estado",
  "Summary": "Resumen", 
  "Sponsor": "Patrocinador",
  "Published": "Publicado",
  "Source": "Fuente",
  "Updated": "Actualizado",
  "Search": "Buscar",
  "All": "Todos",
  "District": "Distrito",
  "Office": "Oficina",
  "Email": "Correo electrónico",
  "Website": "Sitio web",
  "Phone": "Teléfono"
};

export function useSimpleTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("preferredLanguage");
    return (saved as Language) || "en";
  });

  const translateText = useCallback((text: string): string => {
    if (currentLanguage === "en") return text;
    return translations[text] || text;
  }, [currentLanguage]);

  const translatePage = useCallback(() => {
    if (currentLanguage === "es") {
      // Find all text content and translate it
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        (node) => {
          // Skip script and style tags
          const parent = node.parentElement;
          if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          // Only process nodes with meaningful text content
          return node.textContent && node.textContent.trim().length > 0 
            ? NodeFilter.FILTER_ACCEPT 
            : NodeFilter.FILTER_REJECT;
        }
      );

      const textNodes: Text[] = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node as Text);
      }

      // Translate each text node
      textNodes.forEach(textNode => {
        if (textNode.textContent) {
          let translated = textNode.textContent;
          
          // Apply translations
          Object.entries(translations).forEach(([english, spanish]) => {
            // Create regex with word boundaries for better matching
            const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            translated = translated.replace(regex, spanish);
          });
          
          if (translated !== textNode.textContent) {
            textNode.textContent = translated;
          }
        }
      });
    }
  }, [currentLanguage]);

  const toggleLanguage = useCallback(() => {
    const newLanguage = currentLanguage === "en" ? "es" : "en";
    setCurrentLanguage(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
    
    if (newLanguage === "es") {
      // Translate the page after a short delay
      setTimeout(translatePage, 100);
    } else {
      // Reload page to reset to English
      window.location.reload();
    }
  }, [currentLanguage, translatePage]);

  // Auto-translate on load if Spanish is selected
  useEffect(() => {
    if (currentLanguage === "es") {
      setTimeout(translatePage, 500);
    }
  }, [currentLanguage, translatePage]);

  return {
    currentLanguage,
    toggleLanguage,
    t: translateText
  };
}