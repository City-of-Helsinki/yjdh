import { containsRegexp, replaceValues } from '../utils/translation-utils';

type TranslationsApi<Translations> = {
  translations: {
    fi: Translations;
    sv: Translations;
    en: Translations;
  };
  replaced: typeof replaceValues;
  regexp: typeof containsRegexp;
};

export default TranslationsApi;
