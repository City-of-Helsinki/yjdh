// cannot import because build doesn't understand '@frontend/shared/src/i18n/i18n'
// while testcase doesn't understand 'shared/i18n/i18n'
// import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';
// TODO redefined
type Language = 'fi' | 'sv' | 'en';
export const DEFAULT_LANGUAGE: Language = 'fi';

type GetTranslationsFn<T> = (language?: Language) => Promise<T>;

const createGetTranslations =
  <T>(
    translations: Record<Language, T>,
    defaultLanguage = DEFAULT_LANGUAGE
  ): GetTranslationsFn<T> =>
  async (language) =>
    language ? translations[language] : translations[defaultLanguage];

export default createGetTranslations;
