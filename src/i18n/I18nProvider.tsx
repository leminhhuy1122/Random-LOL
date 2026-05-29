"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  type Language,
  type TranslationKey,
  translations,
} from "@/i18n/dictionaries";

const LANGUAGE_STORAGE_KEY = "random-lol-language-v1";

type TranslationValues = Record<string, string | number>;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) {
      setLanguageState(saved);
    }
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage === "vi" ? "vi" : "en";
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values) => translate(language, key, values),
    }),
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language === "vi" ? "vi" : "en";
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

export function translate(language: Language, key: TranslationKey, values?: TranslationValues) {
  const dictionary = (translations[language] ?? translations.en) as Partial<Record<TranslationKey, string>>;
  let text: string = dictionary[key] ?? translations.en[key] ?? key;

  if (!values) {
    return text;
  }

  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });

  return text;
}

export function dataDragonLocale(language: Language) {
  return language === "vi" ? "vi_VN" : "en_US";
}
