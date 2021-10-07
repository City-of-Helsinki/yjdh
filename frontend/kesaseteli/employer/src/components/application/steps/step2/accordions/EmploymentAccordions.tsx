import AddNewEmploymentButton from 'kesaseteli/employer/components/application/steps/step2/accordions/AddNewEmploymentButton';
import EmploymentAccordion from 'kesaseteli/employer/components/application/steps/step2/accordions/EmploymentAccordion';
import EmploymentsErrorNotification from 'kesaseteli/employer/components/application/steps/step2/error-notification/EmploymentsErrorNotification';
import useValidateEmploymentsNotEmpty from 'kesaseteli/employer/hooks/employments/useValidateEmploymentsNotEmpty';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import Application from 'shared/types/application-form-data';

const EmploymentAccordions: React.FC = () => {
  const { t } = useTranslation();
  const { getValues } = useFormContext<Application>();

  const employments = getValues('summer_vouchers') ?? [];
  const stepTitle = t('common:application.step2.header');

  useValidateEmploymentsNotEmpty(employments);

  return (
    <>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step2.tooltip')}
        withoutDivider
      />
      <EmploymentsErrorNotification />
      <FormSection columns={1} withoutDivider>
        {employments.map((employment, index) => (
          <EmploymentAccordion index={index} key={employment.id} />
        ))}
        <AddNewEmploymentButton />
      </FormSection>
    </>
  );
};
export default EmploymentAccordions;
