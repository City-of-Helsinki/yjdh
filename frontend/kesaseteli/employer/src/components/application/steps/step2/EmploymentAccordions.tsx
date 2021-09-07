import { $ApplicationAction, $PrimaryButton } from 'kesaseteli/employer/components/application/form/ActionButtons.sc';
import EmploymentAccordion from 'kesaseteli/employer/components/application/steps/step2/EmploymentAccordion';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import Application from 'shared/types/employer-application';
import Employment from 'shared/types/employment';

const EmploymentAccordions: React.FC = () => {

  const { t } = useTranslation();
  const {
    application,
    addEmployment
  } = useApplicationApi();
  const {control, getValues} = useFormContext<Application>();
  const defaultValue = application?.summer_vouchers ?? [] as Employment[];
  const employments = useWatch({name: 'summer_vouchers', defaultValue, control })
  const stepTitle = t('common:application.step2.header');

  const addNewEmployment = React.useCallback(() => {
    addEmployment(getValues());
  }, [addEmployment, getValues]);

  return (
    <>
      <FormSection header={stepTitle} tooltip={t('common:application.step2.tooltip')}>
        {employments.map((employment, index) => <EmploymentAccordion employment={employment} index={index} key={employment.id} />)}
      </FormSection>
      <FormSection>
        <$ApplicationAction>
          <$PrimaryButton
            data-testid="add-employment"
            onClick={addNewEmployment}
          >
            {t(`common:application.step2.add_employment`)}
          </$PrimaryButton>
        </$ApplicationAction>
      </FormSection>
    </>
  );
};
export default EmploymentAccordions;
