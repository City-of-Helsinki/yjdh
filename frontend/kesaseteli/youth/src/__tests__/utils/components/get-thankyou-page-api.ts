import YouthApplication from 'kesaseteli/youth/types/youth-application';
import YouthFormData from 'kesaseteli/youth/types/youth-form-data';
import { convertFormDataToApplication } from 'kesaseteli/youth/utils/youth-form-data.utils';
import nock from 'nock';
import {
  screen,
  userEvent,
  waitFor,
  within,
} from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
import { MAIN_CONTENT_ID } from 'shared/constants';

type SaveParams = {
  backendExpectation?: (application: YouthApplication) => nock.Scope;
  language?: Language;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getThankYouPageApi = () => {
  return {
    expectations: {
      pageIsLoaded: () => {
        return screen.findByRole('heading', {
          name: /hienoa! olet lähettänyt tietosi kesäsetelijärjestelmään/i,
        });
      },
      activationInfoTextIsPresent: async (hours: number) => {
        return screen.findByText(
          new RegExp(
            `huom! saat sähköpostiisi aktivointilinkin, joka täytyy aktivoida ${hours} tunnin kuluessa`,
            'i'
          )
        );
      },
    },
    actions: {
      async clickGoToFrontPageButton() {
        const button = await screen.findByRole('button', {
          name: /kesäseteli etusivulle/i,
        });
        userEvent.click(button);
      },
    },
  };
};

export default getThankYouPageApi;
