import { Options } from '@frontend/shared/browser-tests/page-models/PageComponent';
import TranslatedComponent from '@frontend/shared/browser-tests/page-models/TranslatedComponent';
import {
  containsRegexp,
  replaceValues,
} from '@frontend/shared/src/__tests__/utils/translation-utils';
import { Selector } from 'testcafe';

import en from '../../public/locales/en/common.json';
import fi from '../../public/locales/fi/common.json';
import sv from '../../public/locales/sv/common.json';
import ApplicantTranslations from '../../test/i18n/applicant-translations';

abstract class ApplicantPageComponent extends TranslatedComponent<ApplicantTranslations> {
  protected constructor(options?: Options) {
    super(
      {
        translations: {
          fi,
          sv,
          en,
        },
        replaced: replaceValues,
        regexp: containsRegexp,
      },
      options
    );
  }

  // eslint-disable-next-line class-methods-use-this
  protected findRadioLabelWithGroupText = (
    groupText: string,
    labelText: string
  ): Selector =>
    Selector('fieldset').withText(groupText).find('label').withText(labelText);
}
export default ApplicantPageComponent;
