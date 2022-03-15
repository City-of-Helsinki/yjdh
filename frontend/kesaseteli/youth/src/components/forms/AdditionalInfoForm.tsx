import useCreateYouthApplicationQuery from 'kesaseteli/youth/hooks/backend/useCreateYouthApplicationQuery';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import { ADDITIONAL_INFO_EXCEPTION_TYPE } from 'kesaseteli-shared/constants/additional-info-exception-type';
import AdditionalInfoException from 'kesaseteli-shared/types/additional-info-exception';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import SaveFormButton from 'shared/components/forms/buttons/SaveFormButton';
import Heading from 'shared/components/forms/heading/Heading';
import Combobox from 'shared/components/forms/inputs/Combobox';
import TextInput from 'shared/components/forms/inputs/TextInput';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell, $Hr } from 'shared/components/forms/section/FormSection.sc';
import { $Notification } from 'shared/components/notification/Notification.sc';
import { useTheme } from 'styled-components';

const AdditionalInfoForm: React.FC = () => {
  const { t } = useTranslation();
  const methods = useForm<AdditionalInfoFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const register = useRegisterInput<AdditionalInfoFormData>('additionalInfo');
  const exceptions: AdditionalInfoException[] = React.useMemo(
    () =>
      ADDITIONAL_INFO_EXCEPTION_TYPE.map((type) => ({
        name: t(`common:additionalInfo.exceptions.${type}`),
      })),
    [t]
  );
  const theme = useTheme();
  return (
    <FormProvider {...methods}>
      <$Notification
        label={t(`common:additionalInfo.notification.confirmed`)}
        type="success"
        size="large"
      >
        {t(`common:additionalInfo.notification.confirmedDescription`)}
      </$Notification>
      <Heading size="l" header={t('common:additionalInfo.title')} as="h2" />
      <p>{t('common:additionalInfo.paragraph_1')}</p>
      <$Hr />
      <form data-testid="additional-info-form">
        <FormSection columns={1} css={{ paddingTop: theme.spacing.l }}>
          <Combobox<AdditionalInfoFormData, AdditionalInfoException>
            {...register('exceptionType', { required: true })}
            optionLabelField="name"
            options={exceptions}
            placeholder={t(
              'common:additionalInfo.form.exceptionTypePlaceholder'
            )}
            label={t('common:additionalInfo.form.exceptionType')}
          />
          <TextInput<AdditionalInfoFormData>
            type="textArea"
            {...register('message', {
              required: true,
            })}
          />
          <$GridCell>
            <SaveFormButton saveQuery={useCreateYouthApplicationQuery()}>
              {t(`common:youthApplication.form.sendButton`)}
            </SaveFormButton>
          </$GridCell>
        </FormSection>
      </form>
      <p>{t('common:additionalInfo.paragraph_2')}</p>
    </FormProvider>
  );
};

export default AdditionalInfoForm;
