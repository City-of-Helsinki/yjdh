import {
  expectToCreateAdditionalInfo,
  expectToGetYouthApplicationStatus,
  expectToReplyErrorWhenCreatingAdditionalInfo,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getYouthTranslationsApi from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import YouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/youth-translations';
import { ADDITIONAL_INFO_REASON_TYPE } from 'kesaseteli-shared/constants/additional-info-reason-type';
import AdditionalInfoApplication from 'kesaseteli-shared/types/additional-info-application';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import AdditionalInfoReasonType from 'kesaseteli-shared/types/additional-info-reason-type';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import {
  waitForBackendRequestsToComplete,
  waitForLoadingCompleted,
} from 'shared/__tests__/utils/component.utils';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

type NotificationType =
  keyof YouthTranslations['additionalInfo']['notification'];

const findReasonsDropdownError = (): HTMLElement | null =>
  screen.queryByTestId('additional_info_user_reasons-error');

const sortReasonsByFormOrder = (
  reasons: AdditionalInfoReasonType[]
): AdditionalInfoReasonType[] =>
  [...reasons].sort(
    (leftReason, rightReason) =>
      ADDITIONAL_INFO_REASON_TYPE.indexOf(leftReason) -
      ADDITIONAL_INFO_REASON_TYPE.indexOf(rightReason)
  );

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

  const findReasonsDropdown = async (): Promise<HTMLElement> => {
    const toggleButton = document.querySelector(
      '#additional_info_user_reasons-toggle-button'
    );

    if (toggleButton instanceof HTMLElement) {
      return toggleButton;
    }

    const byLabel = screen.queryByRole('combobox', {
      name: regexp(translations.additionalInfo.form.reasons),
    });

    if (byLabel) {
      return byLabel;
    }

    const byButton = screen.queryByRole('button', {
      name: regexp(translations.additionalInfo.form.reasons),
    });

    if (byButton) {
      return byButton;
    }

    return screen.findByRole('combobox');
  };

  return {
    expectations: {
      async formIsPresent() {
        await waitForLoadingCompleted();
        await screen.findByRole(
          'heading',
          {
            name: translations.additionalInfo.title,
          },
          { timeout: 3000 }
        );
      },
      async notificationIsPresent(type: NotificationType) {
        await waitForBackendRequestsToComplete();
        await screen.findByRole(
          'heading',
          {
            name: translations.additionalInfo.notification[type],
          },
          { timeout: 3000 }
        );
      },
      async exceptionTypeDropDownHasError(errorText: RegExp) {
        await findReasonsDropdown();
        await waitFor(() => {
          expect(findReasonsDropdownError()).not.toBeNull();
        });
        await screen.findAllByText(errorText);
      },
      async textInputHasError(
        key: keyof AdditionalInfoFormData,
        errorText: RegExp
      ) {
        const input = await screen.findByRole('textbox', {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: regexp((translations.additionalInfo.form as any)[key]),
        });
        await waitFor(() => {
          expect(
            input.matches(':invalid') || input.getAttribute('aria-invalid') === 'true'
          ).toBe(true);
        });
        await screen.findAllByText(errorText);
      },
    },
    actions: {
      async clickAndSelectReasonsFromDropdown(
        reasons: AdditionalInfoReasonType[]
      ) {
        const dropdownToggle = await findReasonsDropdown();
        await userEvent.click(dropdownToggle);
        for (const reason of reasons) {
          const option = await screen.findByRole('option', {
            name: regexp(translations.additionalInfo.reasons[reason]),
          });
          await userEvent.click(option);
        }
        await userEvent.click(dropdownToggle);
        application.additional_info_user_reasons = sortReasonsByFormOrder(
          reasons
        );
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
          await screen.findByRole('button', {
            name: translations.additionalInfo.form.sendButton,
          })
        );
        await waitForLoadingCompleted();
      },
    },
  };
};

export default getAdditionalInfoPageApi;
