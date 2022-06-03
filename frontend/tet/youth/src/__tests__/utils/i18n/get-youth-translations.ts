import TranslationsApi from '@frontend/shared/src/__tests__/types/translations';
import { containsRegexp, replaceValues } from '@frontend/shared/src/__tests__/utils/translation-utils';

import en from '../../../../public/locales/en/common.json';
import fi from '../../../../public/locales/fi/common.json';
import sv from '../../../../public/locales/sv/common.json';
import TetYouthTranslations from './youth-translations';

const getTetYouthTranslationsApi = (): TranslationsApi<TetYouthTranslations> => ({
  translations: {
    fi,
    sv,
    en,
  },
  replaced: replaceValues,
  regexp: containsRegexp,
});

export default getTetYouthTranslationsApi;
