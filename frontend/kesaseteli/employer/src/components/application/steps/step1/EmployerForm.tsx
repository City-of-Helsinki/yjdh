import CompanyInfoGrid from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo';
import Checkbox from 'kesaseteli/employer/components/application/form/Checkbox';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import ContactInputs from 'kesaseteli/employer/components/application/steps/step1/ContactInputs';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import useMountEffect from 'shared/hooks/useMountEffect';
import Application from 'shared/types/application-form-data';

const EmployerForm: React.FC = () => {
  const { t } = useTranslation();
  const stepTitle = t('common:application.step1.header');

  const { application } = useApplicationApi();

  const showInitially = application?.is_separate_invoicer || false;
  const [showInvoicer, setShowInvoicer] =
    React.useState<boolean>(showInitially);

  useMountEffect(() => {
    setShowInvoicer(showInitially);
  });

  const { getValues } = useFormContext<Application>();

  const { updateApplication } = useApplicationApi();

  const handleInvoicerCheckboxChange = React.useCallback(
    (value: boolean) => {
      setShowInvoicer(value);
      if (!value) {
        updateApplication({
          ...getValues(),
          invoicer_name: '',
          invoicer_email: '',
          invoicer_phone_number: '',
        });
      }
    },
    [setShowInvoicer, updateApplication, getValues]
  );

  return (
    <>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step1.tooltip')}
        withoutDivider
      />
      <CompanyInfoGrid />
      <FormSection columns={2}>
        <ContactInputs type="contact_person" />
        <TextInput
          id="street_address"
          validation={{ required: true, maxLength: 256 }}
        />
        <Checkbox
          $colSpan={2}
          id="is_separate_invoicer"
          onChange={handleInvoicerCheckboxChange}
          initialValue={showInitially}
        />
        {showInvoicer && <ContactInputs type="invoicer" />}
      </FormSection>
    </>
  );
};

export default EmployerForm;
