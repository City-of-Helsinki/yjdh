import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import EmploymentAccordion from 'kesaseteli/employer/components/application/steps/step2/EmploymentAccordion';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationForm from 'kesaseteli/employer/hooks/application/useApplicationForm';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {useFieldArray} from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import DraftApplication from 'shared/types/draft-application';
import Employment from 'shared/types/employment';

const EmploymentAccordions: React.FC = () => {

  const { t } = useTranslation();
  const {
    updateApplication,
  } = useApplicationApi();

  const onSubmit = (draftApplication: DraftApplication): void => {
    const summer_vouchers = (draftApplication.summer_vouchers ?? []) as Employment[];
    const application = {
      ...draftApplication,
      // temporary hack until backend fixes the error
      summer_vouchers: summer_vouchers.map((employment) => ({...employment, unnumbered_summer_voucher_reason: 'lorem ipsum'}))
    }
    updateApplication(application);
  };

  const { control } = useApplicationForm();

  const { fields: employments  } = useFieldArray({
    name: 'summer_vouchers',
    control
  });

  const stepTitle = t('common:application.step2.header');
  return (
    <>
      <FormSection header={stepTitle} tooltip={t('common:application.step2.tooltip')}>
        {employments.map((employment, index) => <EmploymentAccordion employment={employment} index={index} key={employment.id} />)}
      </FormSection>
      <ActionButtons
        onSubmit={onSubmit}
      />
    </>
  );
};
export default EmploymentAccordions;
