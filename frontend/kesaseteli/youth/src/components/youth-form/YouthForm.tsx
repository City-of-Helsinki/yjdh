import ForceSubmitInfo from 'kesaseteli/youth/components/youth-form/ForceSubmitInfo';
import SubmitErrorSummary from 'kesaseteli/youth/components/youth-form/SubmitErrorSummary';
import YouthFormFields from 'kesaseteli/youth/components/youth-form/YouthFormFields';
import useCreateYouthApplicationQuery from 'kesaseteli/youth/hooks/backend/useCreateYouthApplicationQuery';
import useHandleYouthApplicationSubmit from 'kesaseteli/youth/hooks/useHandleYouthApplicationSubmit';
import { useTranslation } from 'next-i18next';
import React from 'react';
import SaveFormButton from 'shared/components/forms/buttons/SaveFormButton';
import Heading from 'shared/components/forms/heading/Heading';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import AutoComplete from 'shared/types/auto-complete';

const YouthForm: React.FC = () => {
  const { t } = useTranslation();

  const submitQuery = useCreateYouthApplicationQuery();
  const { handleSaveSuccess, handleErrorResponse, submitError } =
    useHandleYouthApplicationSubmit();
  const showForceSubmitLink = submitError?.type === 'please_recheck_data';
  const formAutoComplete: AutoComplete = 'off';

  return (
    <>
      <Heading header={t('common:youthApplication.form.title')} />
      <form data-testid="youth-form" autoComplete={formAutoComplete}>
        <FormSection columns={2}>
          <$GridCell $colSpan={2}>
            {submitError ? (
              <SubmitErrorSummary error={submitError} />
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
              onInvalidForm={(errors) => {
                // this helps debugging when react tests fail
                if (process.env.NODE_ENV === 'test') {
                  // eslint-disable-next-line no-console
                  console.log('invalid form', errors);
                }
              }}
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
