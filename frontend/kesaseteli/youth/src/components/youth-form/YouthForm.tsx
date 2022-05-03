import CheckFormSummary from 'kesaseteli/youth/components/youth-form/CheckFormSummary';
import ForceSubmitInfo from 'kesaseteli/youth/components/youth-form/ForceSubmitInfo';
import YouthFormFields from 'kesaseteli/youth/components/youth-form/YouthFormFields';
import useCreateYouthApplicationQuery from 'kesaseteli/youth/hooks/backend/useCreateYouthApplicationQuery';
import useHandleYouthApplicationSubmit from 'kesaseteli/youth/hooks/useHandleYouthApplicationSubmit';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import SaveFormButton from 'shared/components/forms/buttons/SaveFormButton';
import Heading from 'shared/components/forms/heading/Heading';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

const YouthForm: React.FC = () => {
  const { t } = useTranslation();

  const { formState } = useFormContext<YouthFormData>();
  const submitQuery = useCreateYouthApplicationQuery();
  const { handleSaveSuccess, handleErrorResponse, showErrorNotification } =
    useHandleYouthApplicationSubmit();
  const showForceSubmitLink = showErrorNotification && !formState.isDirty;

  return (
    <>
      <Heading header={t('common:youthApplication.form.title')} />
      <pre>{JSON.stringify(formState, null, 2)}</pre>
      <form data-testid="youth-form">
        <FormSection columns={2}>
          <$GridCell $colSpan={2}>
            {showErrorNotification ? (
              <CheckFormSummary />
            ) : (
              t('common:youthApplication.form.info')
            )}
          </$GridCell>
          <YouthFormFields />
          <$GridCell $colSpan={2}>
            <SaveFormButton
              saveQuery={submitQuery}
              onSuccess={handleSaveSuccess}
              onError={handleErrorResponse}
            >
              {t(`common:youthApplication.form.sendButton`)}
            </SaveFormButton>
          </$GridCell>
        </FormSection>
        <p>{t(`common:youthApplication.form.requiredInfo`)}</p>
        {showForceSubmitLink && <ForceSubmitInfo />}
      </form>
    </>
  );
};

export default YouthForm;
