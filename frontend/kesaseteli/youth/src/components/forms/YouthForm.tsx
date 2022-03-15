import SchoolSelection from 'kesaseteli/youth/components/forms/SchoolSelection';
import useCreateYouthApplicationQuery from 'kesaseteli/youth/hooks/backend/useCreateYouthApplicationQuery';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import { isYouthApplicationCreationError } from 'kesaseteli/youth/utils/type-guards';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import SaveFormButton from 'shared/components/forms/buttons/SaveFormButton';
import Heading from 'shared/components/forms/heading/Heading';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import SocialSecurityNumberInput from 'shared/components/forms/inputs/SocialSecurityNumberInput';
import TextInput from 'shared/components/forms/inputs/TextInput';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import {
  EMAIL_REGEX,
  NAMES_REGEX,
  PHONE_NUMBER_REGEX,
  POSTAL_CODE_REGEX,
} from 'shared/constants';
import isRealIntegrationsEnabled from 'shared/flags/is-real-integrations-enabled';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGoToPage from 'shared/hooks/useGoToPage';
import useLocale from 'shared/hooks/useLocale';
import { assertUnreachable } from 'shared/utils/typescript.utils';

const YouthForm: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const register = useRegisterInput<YouthFormData>('youthApplication');
  const handleDefaultError = useErrorHandler(false);

  const goToPage = useGoToPage();
  const handleSaveSuccess = React.useCallback(
    (application: CreatedYouthApplication) => {
      const url =
        isRealIntegrationsEnabled() || !application.id
          ? '/thankyou'
          : `/thankyou?id=${application.id}`;
      goToPage(url);
    },
    [goToPage]
  );

  const handleErrorResponse = React.useCallback(
    (error: Error | unknown) => {
      if (isYouthApplicationCreationError(error)) {
        const errorCode = error.response.data.code;
        switch (errorCode) {
          case 'already_assigned':
          case 'email_in_use':
            // eslint-disable-next-line no-console
            console.error('youth application creation error', errorCode, error);
            void router.push(`${locale}/${encodeURIComponent(errorCode)}`);
            return;

          default:
            assertUnreachable(errorCode);
        }
      } else {
        handleDefaultError(error);
      }
    },
    [handleDefaultError, locale, router]
  );

  return (
    <>
      <Heading header={t('common:youthApplication.form.title')} />
      <p>{t('common:youthApplication.form.info')}</p>
      <form data-testid="youth-form">
        <FormSection columns={2}>
          <TextInput<YouthFormData>
            {...register('first_name', {
              required: true,
              pattern: NAMES_REGEX,
              maxLength: 128,
            })}
          />
          <TextInput<YouthFormData>
            {...register('last_name', {
              required: true,
              pattern: NAMES_REGEX,
              maxLength: 128,
            })}
          />
          <SocialSecurityNumberInput<YouthFormData>
            {...register('social_security_number', {
              required: true,
            })}
          />
          <TextInput<YouthFormData>
            {...register('postcode', {
              required: true,
              pattern: POSTAL_CODE_REGEX,
              minLength: 5,
              maxLength: 5,
            })}
          />
          <SchoolSelection />
          <TextInput<YouthFormData>
            {...register('phone_number', {
              required: true,
              maxLength: 64,
              pattern: PHONE_NUMBER_REGEX,
            })}
          />
          <TextInput<YouthFormData>
            {...register('email', {
              maxLength: 254,
              pattern: EMAIL_REGEX,
              required: true,
            })}
          />
          <$GridCell $colSpan={2}>
            <Checkbox<YouthFormData>
              {...register('termsAndConditions', {
                required: true,
              })}
              label={
                <Trans
                  i18nKey="common:youthApplication.form.termsAndConditions"
                  components={{
                    a: (
                      <a
                        href={t('common:termsAndConditionsLink')}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {}
                      </a>
                    ),
                  }}
                >
                  {'Olen lukenut palvelun <a>käyttöehdot</a> ja hyväksyn ne.'}
                </Trans>
              }
            />
          </$GridCell>
          <$GridCell $colSpan={2}>
            <SaveFormButton
              saveQuery={useCreateYouthApplicationQuery()}
              onSuccess={handleSaveSuccess}
              onError={handleErrorResponse}
            >
              {t(`common:youthApplication.form.sendButton`)}
            </SaveFormButton>
          </$GridCell>
        </FormSection>
      </form>
    </>
  );
};

export default YouthForm;
