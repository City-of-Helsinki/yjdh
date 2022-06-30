import getTetAdminTranslationsApi from 'tet/admin/__tests__/utils/i18n/get-tet-admin-translations-api';
import { screen, userEvent, within, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getFormPageApi = () => {
  const {
    translations: { [DEFAULT_LANGUAGE]: translations },
    regexp,
  } = getTetAdminTranslationsApi();

  return {
    expectations: {
      pageIsLoaded: async (heading: string) => {
        await screen.findByRole('heading', {
          name: regexp(heading),
        });
      },
    },
    actions: {},
  };
};

export default getFormPageApi;
