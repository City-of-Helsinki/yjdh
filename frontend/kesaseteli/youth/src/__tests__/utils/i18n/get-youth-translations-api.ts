import { Language } from '@frontend/shared/src/i18n/i18n';
import { assertUnreachable } from '@frontend/shared/src/utils/typescript.utils';
import YouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/youth-translations';
import get from 'lodash/get';
import Leaf from 'shared/types/object-path';
import { escapeRegExp, stripHtmlTags } from 'shared/utils/regex.utils';

import translationsEn from '../../../../public/locales/en/common.json';
import translationsFi from '../../../../public/locales/fi/common.json';
import translationsSv from '../../../../public/locales/sv/common.json';

const getTranslations = (language?: Language): YouthTranslations => {
  switch (language) {
    case 'en':
      return translationsEn;

    case 'sv':
      return translationsSv;

    case 'fi':
    case undefined:
    case null:
      return translationsFi;

    default:
      assertUnreachable(language, 'unsupported language');
  }
  throw new Error(`unsupported language: '${language as string}'`);
};

type TranslationsApi = {
  translations: YouthTranslations;
  replaced: (text: string, replace: Record<string, string | number>) => string;
  regexp: (text: string) => RegExp;
};

const replaced = (
  text: string,
  replace: Record<string, string | number>
): string =>
  Object.entries(replace).reduce(
    (result, [key, val]) =>
      result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'i'), String(val)),
    text
  );
const regexp = (text: string): RegExp => escapeRegExp(stripHtmlTags(text), 'i');

const getYouthTranslationsApi = (language?: Language): TranslationsApi => {
  const translations = getTranslations(language);
  return {
    translations,
    replaced,
    regexp,
  };
};

export default getYouthTranslationsApi;
