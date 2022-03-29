import useCreateAdditionalInfoQuery from 'kesaseteli/youth/hooks/backend/useCreateAdditionalInfoQuery';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import { ADDITIONAL_INFO_REASON_TYPE } from 'kesaseteli-shared/constants/additional-info-reason-type';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import AdditionalInfoReasonOption from 'kesaseteli-shared/types/additional-info-reason-option';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import SaveFormButton from 'shared/components/forms/buttons/SaveFormButton';
import Heading from 'shared/components/forms/heading/Heading';
import MultiSelectDropdown from 'shared/components/forms/inputs/MultiSelectDropdown';
import TextInput from 'shared/components/forms/inputs/TextInput';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell, $Hr } from 'shared/components/forms/section/FormSection.sc';
import { $Notification } from 'shared/components/notification/Notification.sc';
import { useTheme } from 'styled-components';

type Props = {
  applicationId: CreatedYouthApplication['id'];
};

const AdditionalInfoForm: React.FC<Props> = ({ applicationId }) => {
  const { t } = useTranslation();

  const register = useRegisterInput<AdditionalInfoFormData>('additionalInfo');
  const reasons: AdditionalInfoReasonOption[] = React.useMemo(
    () =>
      ADDITIONAL_INFO_REASON_TYPE.map((type) => ({
        name: type,
        label: t(`common:additionalInfo.reasons.${type}`),
      })),
    [t]
  );
  const theme = useTheme();
  return (
    <>
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
          <MultiSelectDropdown<
            AdditionalInfoFormData,
            AdditionalInfoReasonOption
          >
            type="select"
            {...register('additional_info_user_reasons', { required: true })}
            optionLabelField="label"
            options={reasons}
            placeholder={t('common:additionalInfo.form.reasonsPlaceholder')}
            label={t('common:additionalInfo.form.reasons')}
          />
          <TextInput<AdditionalInfoFormData>
            type="textArea"
            {...register('additional_info_description', {
              required: true,
              maxLength: 4096,
            })}
          />
          <$GridCell>
            <SaveFormButton
              saveQuery={useCreateAdditionalInfoQuery(applicationId)}
              theme="black"
            >
              {t(`common:additionalInfo.form.sendButton`)}
            </SaveFormButton>
          </$GridCell>
        </FormSection>
      </form>
      <p>{t('common:additionalInfo.paragraph_2')}</p>
    </>
  );
};

export default AdditionalInfoForm;
