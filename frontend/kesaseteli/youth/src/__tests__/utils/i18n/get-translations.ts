import { Language } from '@frontend/shared/src/i18n/i18n';
import { assertUnreachable } from '@frontend/shared/src/utils/typescript.utils';

import translationsEn from '../../../../public/locales/en/common.json';
import translationsFi from '../../../../public/locales/fi/common.json';
import translationsSv from '../../../../public/locales/sv/common.json';

const getTranslations = async (
  language?: Language
): Promise<typeof translationsFi> => {
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

export default getTranslations;
