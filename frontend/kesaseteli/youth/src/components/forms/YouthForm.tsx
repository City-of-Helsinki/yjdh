import { Button } from 'hds-react';
import useCreateYouthApplicationQuery from 'kesaseteli/youth/hooks/backend/useCreateYouthApplicationQuery';
import useSchoolListQuery from 'kesaseteli/youth/hooks/backend/useSchoolListQuery';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import School from 'kesaseteli/youth/types/School';
import YouthApplication from 'kesaseteli/youth/types/youth-application';
import YouthFormData from 'kesaseteli/youth/types/youth-form-data';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Heading from 'shared/components/forms/heading/Heading';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import Combobox from 'shared/components/forms/inputs/Combobox';
import SocialSecurityNumberInput from 'shared/components/forms/inputs/SocialSecurityNumberInput';
import TextInput from 'shared/components/forms/inputs/TextInput';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { EMAIL_REGEX, NAMES_REGEX, PHONE_NUMBER_REGEX } from 'shared/constants';
import useToggle from 'shared/hooks/useToggle';

const YouthForm: React.FC = () => {
  const { t } = useTranslation();
  const register = useRegisterInput<YouthFormData>();

  const [result, setResult] = React.useState<YouthApplication | null>(null);
  const [schoolIsUnlisted, toggleSchoolIsUnlisted] = useToggle(false);

  const { getValues, handleSubmit, clearErrors, setValue, formState } =
    useFormContext<YouthFormData>();

  const schoolListQuery = useSchoolListQuery();
  const schools: School[] = schoolListQuery.isSuccess
    ? schoolListQuery.data.map((name) => ({ name }))
    : [];

  const schoolsPlaceholderText = React.useMemo(
    () =>
      schoolListQuery.isSuccess
        ? t('common:youthApplication.form.schoolsPlaceholder')
        : t('common:youthApplication.form.schoolsLoading'),
    [schoolListQuery.isSuccess, t]
  );

  const handleToggleSchoolUnlisted = React.useCallback(
    (unlisted?: boolean) => {
      if (unlisted) {
        clearErrors('selectedSchool');
        // eslint-disable-next-line unicorn/no-useless-undefined
        setValue('selectedSchool', undefined);
      } else {
        clearErrors('unlistedSchool');
        setValue('unlistedSchool', '');
      }
      toggleSchoolIsUnlisted();
    },
    [clearErrors, setValue, toggleSchoolIsUnlisted]
  );

  const createYouthApplicationQuery = useCreateYouthApplicationQuery();
  const isSaving = React.useMemo(
    () => createYouthApplicationQuery.isLoading || formState.isSubmitting,
    [createYouthApplicationQuery.isLoading, formState.isSubmitting]
  );
  const handleSaving = React.useCallback(() => {
    createYouthApplicationQuery.mutate(getValues(), {
      onSuccess: (createdApplication) => {
        setResult(createdApplication);
        // TODO: redirect to thank you -page
      },
    });
  }, [createYouthApplicationQuery, getValues, setResult]);

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
              maxLength: 256,
            })}
          />
          <TextInput<YouthFormData>
            {...register('last_name', {
              required: true,
              pattern: NAMES_REGEX,
              maxLength: 256,
            })}
          />
          <SocialSecurityNumberInput<YouthFormData>
            {...register('social_security_number', {
              required: true,
            })}
          />
          <Combobox<YouthFormData, School>
            {...register('selectedSchool', { required: !schoolIsUnlisted })}
            optionLabelField="name"
            options={schools}
            disabled={schoolIsUnlisted || !schoolListQuery.isSuccess}
            placeholder={schoolsPlaceholderText}
            $colSpan={2}
            label={t('common:youthApplication.form.schoolsDropdown')}
          />
          <$GridCell $colSpan={2}>
            <Checkbox<YouthFormData>
              {...register('is_unlisted_school')}
              onChange={handleToggleSchoolUnlisted}
            />
          </$GridCell>
          {schoolIsUnlisted && (
            <TextInput<YouthFormData>
              {...register('unlistedSchool', {
                required: true,
                maxLength: 256,
                pattern: NAMES_REGEX,
              })}
              $colSpan={2}
              label={t('common:youthApplication.form.schoolName')}
              placeholder={t(
                'common:youthApplication.form.schoolNamePlaceholder'
              )}
            />
          )}
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
            <Button
              theme="coat"
              onClick={handleSubmit(handleSaving)}
              disabled={isSaving}
              isLoading={isSaving}
            >
              {t(`common:youthApplication.form.sendButton`)}
            </Button>
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
