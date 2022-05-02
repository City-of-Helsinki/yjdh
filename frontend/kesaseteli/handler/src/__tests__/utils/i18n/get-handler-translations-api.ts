import {
  containsRegexp,
  replaceValues,
} from '@frontend/shared/src/__tests__/utils/translation-utils';

import fi from '../../../../public/locales/fi/common.json';
import HandlerTranslations from './handler-translations';

type TranslationsApi<Translations> = {
  translations: {
    fi: Translations;
  };
  replaced: typeof replaceValues;
  regexp: typeof containsRegexp;
};

const getHandlerTranslationsApi = (): TranslationsApi<HandlerTranslations> => ({
  translations: {
    fi,
  },
  replaced: replaceValues,
  regexp: containsRegexp,
});

export default getHandlerTranslationsApi;
