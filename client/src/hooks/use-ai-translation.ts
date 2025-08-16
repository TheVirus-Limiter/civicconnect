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
      console.log('Translation request:', { targetLanguage, contentLength: content.length });
      
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
        const errorText = await response.text();
        console.error('Translation API error:', errorText);
        throw new Error(`Translation failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Translation result received:', result.targetLanguage);
      return result;
    },
    onSuccess: (result) => {
      console.log('Translation successful, applying content...');
      setTranslatedContent(result.translatedContent);
      setIsTranslating(false);
    },
    onError: (error) => {
      console.error('Translation error:', error);
      setIsTranslating(false);
    },
  });

  const translatePage = useCallback(async (targetLanguage: Language) => {
    console.log('translatePage called:', { currentLanguage, targetLanguage });
    
    if (currentLanguage === targetLanguage) {
      console.log('Already in target language, skipping...');
      return; // Already in target language
    }

    console.log('Starting translation...');
    setIsTranslating(true);
    
    try {
      // Get all text content from the main content area
      const mainContent = document.querySelector('main') || document.body;
      const contentToTranslate = mainContent.innerHTML;
      
      console.log('Content to translate length:', contentToTranslate.length);

      await translationMutation.mutateAsync({
        content: contentToTranslate,
        targetLanguage,
        context: 'Connected Civics - civic engagement platform'
      });

      setCurrentLanguage(targetLanguage);
      localStorage.setItem("preferredLanguage", targetLanguage);
      console.log('Language preference saved:', targetLanguage);
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
    console.log('toggleLanguage called:', { currentLanguage, newLanguage });
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