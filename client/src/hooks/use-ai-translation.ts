import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

export type Language = 'en' | 'es';

interface TranslationResult {
  translatedContent: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export function useAITranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("preferredLanguage");
    return (saved as Language) || "en";
  });
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  const translationMutation = useMutation({
    mutationFn: async ({ content, targetLanguage, context }: {
      content: string;
      targetLanguage: Language;
      context?: string;
    }): Promise<TranslationResult> => {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          targetLanguage,
          context: context || 'civic engagement website'
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      return response.json();
    },
    onSuccess: (result) => {
      setTranslatedContent(result.translatedContent);
      setIsTranslating(false);
    },
    onError: (error) => {
      console.error('Translation error:', error);
      setIsTranslating(false);
    },
  });

  const translatePage = useCallback(async (targetLanguage: Language) => {
    if (currentLanguage === targetLanguage) {
      return; // Already in target language
    }

    setIsTranslating(true);
    
    try {
      // Get all text content from the main content area
      const mainContent = document.querySelector('main') || document.body;
      const contentToTranslate = mainContent.innerHTML;

      await translationMutation.mutateAsync({
        content: contentToTranslate,
        targetLanguage,
        context: 'Connected Civics - civic engagement platform'
      });

      setCurrentLanguage(targetLanguage);
      localStorage.setItem("preferredLanguage", targetLanguage);
    } catch (error) {
      console.error('Failed to translate page:', error);
      setIsTranslating(false);
    }
  }, [currentLanguage, translationMutation]);

  const applyTranslation = useCallback(() => {
    if (translatedContent) {
      const mainContent = document.querySelector('main') || document.body;
      mainContent.innerHTML = translatedContent;
      setTranslatedContent(null);
    }
  }, [translatedContent]);

  const toggleLanguage = useCallback(() => {
    const newLanguage = currentLanguage === "en" ? "es" : "en";
    translatePage(newLanguage);
  }, [currentLanguage, translatePage]);

  return {
    currentLanguage,
    isTranslating,
    translatePage,
    toggleLanguage,
    applyTranslation,
    translatedContent,
    isSpanish: currentLanguage === "es",
  };
}