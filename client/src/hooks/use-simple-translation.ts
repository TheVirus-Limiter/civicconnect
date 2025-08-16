import { useState, useCallback } from "react";

export type Language = "en" | "es";

const translations: Record<string, string> = {
  // Page sections
  "Your Representatives": "Sus Representantes",
  "Recent Bills": "Proyectos de Ley Recientes",
  "Breaking News": "Últimas Noticias", 
  "Community Polls": "Encuestas de la Comunidad",
  
  // UI Elements
  "Contact": "Contactar",
  "Learn More": "Aprende Más",
  "More Info": "Más Información",
  "Party": "Partido",
  "Years in Office": "Años en el Cargo",
  "Bills Sponsored": "Proyectos Patrocinados",
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
  "Sponsor": "Patrocinador",
  
  // Hero and main content
  "Connected Civics": "Cívicos Conectados",
  "Your Voice in TX-23": "Tu Voz en TX-23",
  "Stay Connected to Your Democracy": "Manténgase Conectado a Su Democracia",
  "Track legislation, understand complex bills with AI assistance, and engage with your representatives—all in English and Spanish.": "Rastree la legislación, comprenda proyectos de ley complejos con asistencia de IA y participe con sus representantes, todo en inglés y español.",
  "Explore Bills": "Explorar Proyectos",
  "Learn How It Works": "Aprenda Cómo Funciona",
  "Get Started": "Empezar",
  "Learn How": "Aprende Cómo",
  "Engage": "Participar",
  "Learn": "Aprender",
  
  // Legislator specific  
  "Search": "Buscar",
  "No recent activity": "Sin actividad reciente",
  
  // Common words
  "District": "Distrito",
  "Office": "Oficina",
  "Email": "Correo electrónico",
  "Website": "Sitio web",
  "Phone": "Teléfono",
  
  // Stats and numbers
  "Active Bills": "Proyectos Activos",
  "Recent Updates": "Actualizaciones Recientes",
  "Local Bills": "Proyectos Locales",
  "Available in English and Spanish": "Disponible en inglés y español",
  
  // Community sections
  "Join the Community": "Únete a la Comunidad",
  "Make your voice heard on important issues in TX-23": "Haz escuchar tu voz en temas importantes en TX-23",
  "Vote on local issues": "Vota en temas locales",
  "Share your opinion on healthcare, infrastructure, border security, and other key issues affecting our district.": "Comparte tu opinión sobre atención médica, infraestructura, seguridad fronteriza y otros temas clave que afectan nuestro distrito.",
  "View Active Polls": "Ver Encuestas Activas",
  "Community Feedback": "Comentarios de la Comunidad",
  "Share your concerns": "Comparte tus preocupaciones",
  "Submit feedback about local issues, suggest improvements, and see responses from your representatives.": "Envía comentarios sobre temas locales, sugiere mejoras y ve respuestas de tus representantes.",
  "Submit Feedback": "Enviar Comentarios",
  
  // Bill filtering and search
  "Filter Bills": "Filtrar Proyectos",
  "Search bills...": "Buscar proyectos...",
  "Active": "Activo",
  "Passed": "Aprobado",
  "Failed": "Fallido",
  "Category": "Categoría",
  "All Categories": "Todas las Categorías",
  "Jurisdiction": "Jurisdicción",
  "All Levels": "Todos los Niveles",
  "Clear Filters": "Limpiar Filtros",
  "Most Recent": "Más Recientes",
  
  // Bill status
  "PASSED HOUSE": "APROBADO EN CÁMARA",
  "IN COMMITTEE": "EN COMITÉ",
  "Bill Progress": "Progreso del Proyecto",
  "Committee": "Comité",
  "House": "Cámara",
  "Senate": "Senado",
  "Updated": "Actualizado",
  "Ask AI": "Preguntar a IA",
  "Save": "Guardar",
  "Share": "Compartir",
  "View Details": "Ver Detalles",
  "Load More Bills": "Cargar Más Proyectos",
  
  // News sections
  "Civic News": "Noticias Cívicas",
  "Explainer": "Explicativo",
  "BREAKING": "ÚLTIMA HORA",
  
  // AI Assistant
  "Meet Civica": "Conoce a Cívica",
  "Your AI assistant for understanding legislation": "Tu asistente de IA para entender la legislación",
  "Hello! I'm Civica, your AI assistant for understanding legislation. I can help explain bills, their impacts, and answer questions about the legislative process. What would you like to know?": "¡Hola! Soy Cívica, tu asistente de IA para entender la legislación. Puedo ayudar a explicar proyectos, sus impactos y responder preguntas sobre el proceso legislativo. ¿Qué te gustaría saber?",
  "Ask me anything about legislation...": "Pregúntame cualquier cosa sobre legislación...",
  "How does a bill become a law?": "¿Cómo se convierte un proyecto en ley?",
  "What's happening locally?": "¿Qué está pasando localmente?",
  "Explain a bill": "Explicar un proyecto",
  
  // Civic Education section
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
  
  // Events section
  "Find town halls, city council meetings, and other civic events in your area.": "Encuentra ayuntamientos, reuniones del consejo municipal y otros eventos cívicos en tu área.",
  "No upcoming events found": "No se encontraron eventos próximos",
  "Check back soon for new civic events": "Vuelve pronto para nuevos eventos cívicos",
  "View All Events": "Ver Todos los Eventos",
  
  // Voter Information
  "Voter Information": "Información del Votante",
  "Check your registration status, find polling locations, and get important voting dates.": "Verifica tu estado de registro, encuentra lugares de votación y obtén fechas importantes de votación.",
  "Next Election": "Próxima Elección",
  "days": "días",
  
  // Recent Activity
  "Recent Activity": "Actividad Reciente",
  "Voted Yes on": "Votó Sí en",
  "Sponsored on": "Patrocinó",
  "Border Security Enhancement Act": "Ley de Mejora de Seguridad Fronteriza",
  "Rural Broadband Infrastructure Bill": "Proyecto de Ley de Infraestructura de Banda Ancha Rural",
  "Voted No on": "Votó No en",
  "Co-sponsored": "Co-patrocinó",
  "Proposed": "Propuso",
  "Signed": "Firmó",
  
  // Take Action section
  "Take Action": "Tomar Acción",
  "Contact Your Reps": "Contacta a tus Representantes",
  "Generate personalized letters to your representatives about important legislation.": "Genera cartas personalizadas a tus representantes sobre legislación importante.",
  "Select a bill to discuss": "Selecciona un proyecto para discutir",
  "Generate Template": "Generar Plantilla",
  "Upcoming Events": "Próximos Eventos",
  "Check Registration Status": "Verificar Estado de Registro"
};

export function useSimpleTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("preferredLanguage");
    return (saved as Language) || "en";
  });

  const translateText = useCallback((text: string, targetLanguage: Language = currentLanguage): string => {
    if (targetLanguage === "en") return text;
    
    // Direct lookup for exact matches
    if (translations[text]) {
      return translations[text];
    }
    
    // Fallback: Simple text replacement for Spanish
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