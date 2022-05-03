import { TranslationsApi } from '@frontend/shared/src/__tests__/types/translations';
import { containsRegexp, replaceValues } from '@frontend/shared/src/__tests__/utils/translation-utils';

import en from '../../../../public/locales/en/common.json';
import fi from '../../../../public/locales/fi/common.json';
import sv from '../../../../public/locales/sv/common.json';
import TetAdminTranslations from './tet-admin-translations';

const getTetAdminTranslationsApi = (): TranslationsApi<TetAdminTranslations> => ({
  translations: {
    fi,
    sv,
    en,
  },
  replaced: replaceValues,
  regexp: containsRegexp,
});

export default getTetAdminTranslationsApi;
