import CompanyInfoGrid from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo';
import Checkbox from 'kesaseteli/employer/components/application/form/Checkbox';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import ContactInputs from 'kesaseteli/employer/components/application/steps/step1/ContactInputs';
import EmployerErrorSummary from 'kesaseteli/employer/components/application/steps/step1/EmployerErrorSummary';
import useInvoicerToggle from 'kesaseteli/employer/hooks/application/useInvoicerToggle';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import Application from 'shared/types/application-form-data';

const EmployerForm: React.FC = () => {
  const { t } = useTranslation();
  const stepTitle = t('common:application.step1.header');

  const { trigger, formState } = useFormContext<Application>();

  const [showInvoicer, toggleInvoicer] = useInvoicerToggle();

  const onToggleInvoicer = React.useCallback(() => {
    if (formState.isSubmitted) {
      void trigger();
    }
    toggleInvoicer();
  }, [formState.isSubmitted, toggleInvoicer, trigger]);

  return (
    <>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step1.tooltip')}
        withoutDivider
      />
      <CompanyInfoGrid />
      <EmployerErrorSummary />
      <FormSection columns={2}>
        <ContactInputs type="contact_person" />
        <TextInput
          id="street_address"
          validation={{ required: true, maxLength: 256 }}
        />
        <Checkbox
          $colSpan={2}
          id="is_separate_invoicer"
          onChange={onToggleInvoicer}
          initialValue={showInvoicer}
        />
        {showInvoicer && <ContactInputs type="invoicer" />}
      </FormSection>
    </>
  );
};

export default EmployerForm;
