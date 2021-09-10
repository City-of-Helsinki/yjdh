export type Language = 'fi' | 'sv' | 'en';
export type I18nNamespace = 'common';

export const DEFAULT_LANGUAGE: Language = 'fi';

export const SUPPORTED_LANGUAGES: readonly Language[] = [
  'fi',
  'sv',
  'en',
] as const;
