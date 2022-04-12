export type I18nNamespace = 'common';
export const SUPPORTED_LANGUAGES = ['fi', 'sv', 'en'] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number];

export const DEFAULT_LANGUAGE: Language = 'fi' as const;
