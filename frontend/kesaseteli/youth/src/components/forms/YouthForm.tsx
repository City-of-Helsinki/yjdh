import SchoolSelection from 'kesaseteli/youth/components/forms/SchoolSelection';
import useCreateYouthApplicationQuery from 'kesaseteli/youth/hooks/backend/useCreateYouthApplicationQuery';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import CreatedYouthApplication from 'kesaseteli/youth/types/created-youth-application';
import YouthFormData from 'kesaseteli/youth/types/youth-form-data';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import SaveFormButton from 'shared/components/forms/buttons/SaveFormButton';
import Heading from 'shared/components/forms/heading/Heading';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import SocialSecurityNumberInput from 'shared/components/forms/inputs/SocialSecurityNumberInput';
import TextInput from 'shared/components/forms/inputs/TextInput';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { EMAIL_REGEX, NAMES_REGEX, PHONE_NUMBER_REGEX } from 'shared/constants';

const YouthForm: React.FC = () => {
  const { t } = useTranslation();
  const register = useRegisterInput<YouthFormData>();

  const [result, setResult] = React.useState<CreatedYouthApplication | null>(
    null
  );

  const handleSaveSuccess = React.useCallback(
    (createdApplication: CreatedYouthApplication) => {
      setResult(createdApplication);
      // TODO: redirect to thank you -page
    },
    [setResult]
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
            >
              {t(`common:youthApplication.form.sendButton`)}
            </SaveFormButton>
          </$GridCell>
          {result && (
            <pre data-testid="result">{JSON.stringify(result, null, 2)}</pre>
          )}
        </FormSection>
      </form>
    </>
  );
};

export default YouthForm;
