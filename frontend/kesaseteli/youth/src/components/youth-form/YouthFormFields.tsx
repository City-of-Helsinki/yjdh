import SchoolSelection from 'kesaseteli/youth/components/youth-form/SchoolSelection';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import SocialSecurityNumberInput from 'shared/components/forms/inputs/SocialSecurityNumberInput';
import TextInput from 'shared/components/forms/inputs/TextInput';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import {
  EMAIL_REGEX,
  NAMES_REGEX,
  PHONE_NUMBER_REGEX,
  POSTAL_CODE_REGEX,
} from 'shared/constants';

const YouthFormFields: React.FC = () => {
  const { t } = useTranslation();

  const register = useRegisterInput<YouthFormData>('youthApplication');

  return (
    <>
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
          required: true,
          maxLength: 254,
          pattern: EMAIL_REGEX,
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
    </>
  );
};

export default YouthFormFields;
