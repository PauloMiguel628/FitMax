import { ptBR, TranslationKeys } from './pt-BR';
import { en } from './en';
import { useProfileStore } from '@/store/profileStore';

export const translations = {
  'pt-BR': ptBR,
  en,
};

export function getTranslation(locale: 'pt-BR' | 'en'): TranslationKeys {
  return translations[locale] || ptBR;
}

export function useTranslation() {
  const locale = useProfileStore((state) => state.profile.locale);
  const t = translations[locale] || ptBR;
  return { t, locale };
}

export * from './pt-BR';
