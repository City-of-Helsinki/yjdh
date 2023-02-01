import { Options } from '@frontend/shared/browser-tests/page-models/PageComponent';
import TranslatedComponent from '@frontend/shared/browser-tests/page-models/TranslatedComponent';
import {
  containsRegexp,
  replaceValues,
} from '@frontend/shared/src/__tests__/utils/translation-utils';

import fi from '../../public/locales/fi/common.json';
import en from '../../public/locales/en/common.json';
import sv from '../../public/locales/sv/common.json';

import HandlerTranslations from '../../test/i18n/handler-translations';

abstract class HandlerPageComponent extends TranslatedComponent<HandlerTranslations> {
  public datatestId;
  protected constructor(options?: Options) {
    super(
      {
        translations: {
          fi,
          en,
          sv,
        },
        replaced: replaceValues,
        regexp: containsRegexp,
      },
      options
    );
    this.datatestId = options?.datatestId || '';
  }
}
export default HandlerPageComponent;
