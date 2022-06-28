import {
  expectToCreateAdditionalInfo,
  expectToGetYouthApplicationStatus,
  expectToReplyErrorWhenCreatingAdditionalInfo,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getYouthTranslationsApi from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import YouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/youth-translations';
import AdditionalInfoApplication from 'kesaseteli-shared/types/additional-info-application';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import AdditionalInfoReasonType from 'kesaseteli-shared/types/additional-info-reason-type';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import {
  waitForBackendRequestsToComplete,
  waitForLoadingCompleted,
} from 'shared/__tests__/utils/component.utils';
import { screen, userEvent } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

type NotificationType =
  keyof YouthTranslations['additionalInfo']['notification'];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getAdditionalInfoPageApi = (
  id?: CreatedYouthApplication['id'],
  initialApplication?: Partial<AdditionalInfoApplication>,
  lang?: Language
) => {
  const {
    translations: { [lang ?? DEFAULT_LANGUAGE]: translations },
    regexp,
  } = getYouthTranslationsApi();
  const application = {
    language: lang ?? DEFAULT_LANGUAGE,
    ...initialApplication,
  };
  return {
    expectations: {
      async formIsPresent() {
        await waitForLoadingCompleted();
        await screen.findByRole('heading', {
          name: translations.additionalInfo.title,
        });
      },
      async notificationIsPresent(type: NotificationType) {
        await waitForBackendRequestsToComplete();
        await screen.findByRole('heading', {
          name: translations.additionalInfo.notification[type],
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
          name: regexp(translations.additionalInfo.form.reasons),
        });
        await userEvent.click(dropdownToggle);
        for (const reason of reasons) {
          const option = await screen.findByText(
            translations.additionalInfo.reasons[reason]
          );
          option.click();
        }
        await userEvent.click(dropdownToggle);
        application.additional_info_user_reasons = reasons;
      },
      async inputDescription(description: string) {
        const textArea = await screen.findByRole('textbox', {
          name: regexp(
            translations.additionalInfo.form.additional_info_description
          ),
        });
        await userEvent.clear(textArea);
        if (description?.length > 0) {
          await userEvent.type(textArea, description);
        }
        (application as AdditionalInfoApplication).additional_info_description =
          description;
      },
      async clickSendButton(returnCode?: 200 | 400 | 500) {
        if (!id) {
          throw new Error('you forgot to give application id');
        }
        if (returnCode === 400 || returnCode === 500) {
          expectToReplyErrorWhenCreatingAdditionalInfo(
            id,
            application as AdditionalInfoApplication,
            returnCode
          );
        } else if (returnCode === 200) {
          expectToCreateAdditionalInfo(
            id,
            application as AdditionalInfoApplication
          );
          expectToGetYouthApplicationStatus(id, {
            status: 'additional_information_provided',
          });
        }
        await userEvent.click(
          screen.getByRole('button', {
            name: translations.additionalInfo.form.sendButton,
          })
        );
        await waitForLoadingCompleted();
      },
    },
  };
};

export default getAdditionalInfoPageApi;
