import { useState, useCallback } from "react";
import { translations, type TranslationKey, type Language } from "@/lib/i18n";

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("preferredLanguage");
    return (saved as Language) || "en";
  });

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    try {
      const keys = key.split('.');
      let translation: any = translations[language];
      
      // Navigate through nested keys
      for (const k of keys) {
        if (translation && typeof translation === 'object' && k in translation) {
          translation = translation[k];
        } else {
          // Fallback to English
          translation = translations.en;
          for (const fallbackKey of keys) {
            if (translation && typeof translation === 'object' && fallbackKey in translation) {
              translation = translation[fallbackKey];
            } else {
              console.warn(`Translation key not found: ${key}`);
              return key; // Return the key if not found
            }
          }
          break;
        }
      }
      
      // Ensure we have a string result
      if (typeof translation !== 'string') {
        console.warn(`Translation is not a string for key: ${key}`, translation);
        return key;
      }
      
      // Handle parameter substitution
      if (params && typeof translation === "string") {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, String(value));
        });
      }
      
      return translation;
    } catch (error) {
      console.error(`Error translating key: ${key}`, error);
      return key;
    }
  }, [language]);

  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === "en" ? "es" : "en";
    changeLanguage(newLanguage);
  }, [language, changeLanguage]);

  return {
    language,
    t,
    changeLanguage,
    toggleLanguage,
    isSpanish: language === "es",
  };
}
