import {
  expectToCreateAdditionalInfo,
  expectToGetYouthApplicationStatus,
  expectToReplyErrorWhenCreatingAdditionalInfo,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import AdditionalInfoApplication from 'kesaseteli-shared/types/additional-info-application';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import AdditionalInfoReasonType from 'kesaseteli-shared/types/additional-info-reason-type';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import { screen, userEvent } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

import translations from '../../../../public/locales/fi/common.json';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getAdditionalInfoPageApi = (
  initialApplication: Partial<AdditionalInfoApplication> & {
    id?: CreatedYouthApplication['id'];
  } = {}
) => {
  const { id, ...application } = {
    language: DEFAULT_LANGUAGE,
    ...initialApplication,
  };
  return {
    expectations: {
      async formIsPresent() {
        await screen.findByRole('heading', {
          name: /tarkenna hakemustasi/i,
        });
      },
      async applicationWasSent() {
        await screen.findByRole('heading', {
          name: /kiitos! tarkennus on nyt lähetetty./i,
        });
      },
      async applicationWasNotFound() {
        await screen.findByRole('heading', {
          name: /hakemusta ei löytynyt/i,
        });
      },
      async exceptionTypeDropDownHasError(errorText: RegExp) {
        const elem = await screen.findByTestId(
          'additional_info_user_reasons-error'
        );
        expect(elem).toHaveTextContent(errorText);
      },
      async textInputHasError(
        key: keyof AdditionalInfoFormData,
        errorText: RegExp
      ) {
        const input = await screen.findByTestId(key as string);
        expect(input).toBeInvalid();
        expect(
          input.parentElement?.parentElement?.parentElement
        ).toHaveTextContent(errorText);
      },
    },
    actions: {
      async clickAndSelectReasonsFromDropdown(
        reasons: AdditionalInfoReasonType[]
      ) {
        const dropdownToggle = await screen.findByRole('button', {
          name: /otsikko/i,
        });
        dropdownToggle.click();
        for (const reason of reasons) {
          const option = await screen.findByText(
            translations.additionalInfo.reasons[reason]
          );
          userEvent.click(option);
        }
        application.additional_info_user_reasons = reasons;
      },
      async inputDescription(description: string) {
        const textArea = await screen.findByRole('textbox', {
          name: /lisätiedot/i,
        });
        userEvent.clear(textArea);
        if (description?.length > 0) {
          userEvent.type(textArea, description);
        }
        (application as AdditionalInfoApplication).additional_info_description =
          description;
      },
      async clickSendButton(returnCode?: 200 | 400 | 500) {
        if (returnCode === 400 || returnCode === 500) {
          expectToReplyErrorWhenCreatingAdditionalInfo(returnCode);
        } else if (returnCode === 200) {
          if (!id) {
            throw new Error('you forgot to give id');
          }
          expectToCreateAdditionalInfo(
            application as AdditionalInfoApplication
          );
          expectToGetYouthApplicationStatus(id, {
            status: 'additional_information_provided',
          });
        }
        userEvent.click(screen.getByRole('button', { name: /lähetä tiedot/i }));
        await waitForBackendRequestsToComplete();
      },
    },
  };
};

export default getAdditionalInfoPageApi;
