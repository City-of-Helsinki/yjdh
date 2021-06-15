import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  DEFAULT_LANGUAGE,
  Language,
  SUPPORTED_LANGUAGES,
} from 'shared/i18n/i18n';

const useLocale = (): Language => {
  const { i18n } = useTranslation();
  const language = i18n.language as Language;
  const router = useRouter();
  const locales = router.locales ?? SUPPORTED_LANGUAGES;
  const defaultLocale = (router.defaultLocale ?? DEFAULT_LANGUAGE) as Language;
  return locales.includes(language) ? language : defaultLocale;
};

export default useLocale;
