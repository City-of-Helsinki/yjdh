import DateInput from 'kesaseteli/handler/components/form/DateInput';
import SelectionGroup from 'kesaseteli/handler/components/form/SelectionGroup';
import SubmitErrorSummary from 'kesaseteli/handler/components/form/SubmitErrorSummary';
import TextInput from 'kesaseteli/handler/components/form/TextInput';
import useHandleApplicationWithoutSsnSubmit from 'kesaseteli/handler/hooks/application/useHandleApplicationWithoutSsnSubmit';
import useCreateYouthApplicationWithoutSsnQuery from 'kesaseteli/handler/hooks/backend/useCreateYouthApplicationWithoutSsnQuery';
import { useTranslation } from 'next-i18next';
import React from 'react';
import SaveFormButton from 'shared/components/forms/buttons/SaveFormButton';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import $Notification from 'shared/components/notification/Notification.sc';
import {
  EMAIL_REGEX,
  NAMES_REGEX,
  PHONE_NUMBER_REGEX,
  POSTAL_CODE_REGEX,
} from 'shared/constants';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';

const CreateApplicationWithoutSsnForm: React.FC = () => {
  const { t } = useTranslation();

  const submitQuery = useCreateYouthApplicationWithoutSsnQuery();
  const { handleSaveSuccess, handleErrorResponse, submitError } =
    useHandleApplicationWithoutSsnSubmit();

  return (
    <>
      <$Notification
        label={t('common:applicationWithoutSsn.form.usageInfo')}
        type="info"
      />
      {submitError && (
        <$GridCell $colSpan={2}>
          <SubmitErrorSummary error={submitError} />
        </$GridCell>
      )}
      <SelectionGroup
        id="language"
        validation={{ required: true }}
        direction="horizontal"
        values={
          /* Prioritize English for immigrants/refugees by sorting i.e. ["en", "fi", "sv"] */
          [...SUPPORTED_LANGUAGES].sort()
        }
        $colSpan={2}
      />
      <TextInput
        id="firstName"
        validation={{ required: true, pattern: NAMES_REGEX, maxLength: 128 }}
        autoComplete="off"
      />
      <TextInput
        id="lastName"
        validation={{ required: true, pattern: NAMES_REGEX, maxLength: 128 }}
        autoComplete="off"
      />
      <DateInput id="nonVtjBirthdate" validation={{ required: true }} />
      <TextInput
        id="postcode"
        type="number"
        validation={{
          required: true,
          pattern: POSTAL_CODE_REGEX,
          maxLength: 5,
        }}
        autoComplete="off"
      />
      <TextInput
        id="school"
        validation={{ required: true, pattern: NAMES_REGEX, maxLength: 256 }}
        $colSpan={2}
        autoComplete="off"
      />
      <TextInput
        id="phoneNumber"
        validation={{
          required: true,
          pattern: PHONE_NUMBER_REGEX,
          maxLength: 64,
        }}
        autoComplete="off"
      />
      <TextInput
        id="email"
        validation={{ required: true, pattern: EMAIL_REGEX, maxLength: 254 }}
        autoComplete="off"
      />
      <TextInput
        id="additionalInfoDescription"
        validation={{ required: true, maxLength: 4096 }}
        autoComplete="off"
        type="textArea"
        $colSpan={2}
      />
      <TextInput
        id="nonVtjHomeMunicipality"
        validation={{ required: false, pattern: NAMES_REGEX, maxLength: 64 }}
        autoComplete="off"
        $colSpan={2}
      />
      <$Notification
        label={t('common:applicationWithoutSsn.form.emailCheckAlert')}
        type="alert"
      />
      <$GridCell $colSpan={2}>
        <SaveFormButton
          saveQuery={submitQuery}
          onSuccess={handleSaveSuccess}
          onError={handleErrorResponse}
          onInvalidForm={(errors) => {
            // this helps debugging when react tests fail
            if (process.env.NODE_ENV === 'test') {
              // eslint-disable-next-line no-console
              console.error('invalid form', errors);
            }
          }}
        >
          {t(`common:applicationWithoutSsn.form.sendButton`)}
        </SaveFormButton>
      </$GridCell>
    </>
  );
};

export default CreateApplicationWithoutSsnForm;
