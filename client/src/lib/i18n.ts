// Simple i18n implementation for Connected Civics
export interface Translations {
  [key: string]: string;
}

export const translations: Record<string, Translations> = {
  en: {
    // Navigation
    'nav.bills': 'Bills',
    'nav.news': 'News', 
    'nav.legislators': 'Representatives',
    'nav.engage': 'Engage',
    'nav.education': 'Learn',
    
    // Hero section
    'hero.title': 'Stay Connected to Your Democracy',
    'hero.subtitle': 'Track legislation, understand complex bills with AI assistance, and engage with your representatives—all in English and Spanish.',
    
    // Location
    'location.current': 'Current Location',
    'location.change': 'Change Location',
    'location.detecting': 'Detecting location...',
    
    // Stats
    'stats.activeBills': 'Active Bills',
    'stats.recentUpdates': 'Recent Updates',
    'stats.localBills': 'Local Bills',
    'stats.representatives': 'Your Representatives',
    
    // Bills
    'bills.title': 'Current Legislation',
    'bills.subtitle': 'Stay informed about bills affecting your community',
    'bills.viewAll': 'View All Bills',
    'bills.status.introduced': 'Introduced',
    'bills.status.inCommittee': 'In Committee',
    'bills.status.passedHouse': 'Passed House',
    'bills.status.passedSenate': 'Passed Senate',
    'bills.status.signed': 'Signed into Law',
    
    // News
    'news.title': 'Civic News',
    'news.subtitle': 'Latest updates on government and policy',
    'news.breaking': 'Breaking',
    'news.local': 'Local',
    'news.readMore': 'Read More',
    
    // Legislators
    'legislators.title': 'Your Representatives',
    'legislators.subtitle': 'Connect with your elected officials',
    'legislators.contact': 'Contact',
    'legislators.website': 'Website',
    
    // Engagement
    'engage.title': 'Take Action',
    'engage.subtitle': 'Make your voice heard in democracy',
    'engage.contact': 'Contact Representatives',
    'engage.volunteer': 'Volunteer',
    'engage.vote': 'Voting Information',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Try Again',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
  },
  
  es: {
    // Navigation
    'nav.bills': 'Proyectos de Ley',
    'nav.news': 'Noticias',
    'nav.legislators': 'Representantes', 
    'nav.engage': 'Participar',
    'nav.education': 'Aprender',
    
    // Hero section
    'hero.title': 'Mantente Conectado a tu Democracia',
    'hero.subtitle': 'Rastrea legislación, entiende proyectos de ley complejos con asistencia de IA, y participa con tus representantes—todo en inglés y español.',
    
    // Location
    'location.current': 'Ubicación Actual',
    'location.change': 'Cambiar Ubicación',
    'location.detecting': 'Detectando ubicación...',
    
    // Stats
    'stats.activeBills': 'Proyectos Activos',
    'stats.recentUpdates': 'Actualizaciones Recientes', 
    'stats.localBills': 'Proyectos Locales',
    'stats.representatives': 'Tus Representantes',
    
    // Bills
    'bills.title': 'Legislación Actual',
    'bills.subtitle': 'Mantente informado sobre proyectos que afectan tu comunidad',
    'bills.viewAll': 'Ver Todos los Proyectos',
    'bills.status.introduced': 'Introducido',
    'bills.status.inCommittee': 'En Comité',
    'bills.status.passedHouse': 'Aprobado en Cámara',
    'bills.status.passedSenate': 'Aprobado en Senado', 
    'bills.status.signed': 'Firmado como Ley',
    
    // News
    'news.title': 'Noticias Cívicas',
    'news.subtitle': 'Últimas actualizaciones sobre gobierno y política',
    'news.breaking': 'Última Hora',
    'news.local': 'Local',
    'news.readMore': 'Leer Más',
    
    // Legislators
    'legislators.title': 'Tus Representantes',
    'legislators.subtitle': 'Conéctate con tus funcionarios electos',
    'legislators.contact': 'Contactar',
    'legislators.website': 'Sitio Web',
    
    // Engagement
    'engage.title': 'Tomar Acción',
    'engage.subtitle': 'Haz escuchar tu voz en la democracia',
    'engage.contact': 'Contactar Representantes',
    'engage.volunteer': 'Voluntariado',
    'engage.vote': 'Información de Votación',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.retry': 'Intentar de Nuevo',
    'common.close': 'Cerrar',
    'common.save': 'Guardar', 
    'common.cancel': 'Cancelar',
  }
};

export function translate(key: string, language: 'en' | 'es' = 'en'): string {
  return translations[language]?.[key] || translations.en[key] || key;
}