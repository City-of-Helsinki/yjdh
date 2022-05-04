import TranslatedComponent from '@frontend/shared/browser-tests/page-models/TranslatedComponent';
import { TranslationsApi } from '@frontend/shared/src/__tests__/types/translations';
import {
  containsRegexp,
  replaceValues,
} from '@frontend/shared/src/__tests__/utils/translation-utils';

import en from '../../public/locales/en/common.json';
import fi from '../../public/locales/fi/common.json';
import sv from '../../public/locales/sv/common.json';
import YouthTranslations from '../../src/__tests__/utils/i18n/youth-translations';

abstract class YouthPageComponent extends TranslatedComponent<YouthTranslations> {
  // eslint-disable-next-line class-methods-use-this
  getTranslationsApi(): TranslationsApi<YouthTranslations> {
    return {
      translations: {
        fi,
        sv,
        en,
      },
      replaced: replaceValues,
      regexp: containsRegexp,
    };
  }
}
export default YouthPageComponent;
