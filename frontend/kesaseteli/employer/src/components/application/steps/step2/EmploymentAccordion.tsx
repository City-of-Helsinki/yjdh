import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import EmploymentActionButtons from 'kesaseteli/employer/components/application/steps/step2/EmploymentActionButtons';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext,useWatch } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import EmployerApplication from 'shared/types/employer-application';
import Employment from 'shared/types/employment';
import { isEmpty } from 'shared/utils/string.utils';

import { $Accordion, $EmploymentFormGrid } from './EmploymentAccordion.sc';

type Props = {
  employment: Employment,
  index: number
}

const EmploymentAccordion: React.FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const {employment, index } = props;
  const defaultHeading = `${t(`common:application.step2.employment`)} #${index + 1}`
  const { control } = useFormContext<EmployerApplication>();
  const employeeName = useWatch({name: `summer_vouchers.${index}.employee_name`, control});
  const heading = isEmpty(employeeName) ? defaultHeading : employeeName;

  return (
    <$Accordion heading={heading} key={employment.id}>
      <FormSection>
        <$EmploymentFormGrid>
          <TextInput
            id={`summer_vouchers.${index}.employee_name`}
            validation={{ required: true, maxLength: 256 }}
          />
          <TextInput
            id={`summer_vouchers.${index}.employee_ssn`}
            validation={{
              required: true,
              maxLength: 20, // eslint-disable-next-line security/detect-unsafe-regex
            }}
          />
        </$EmploymentFormGrid>
      </FormSection>
      <FormSection>
        <EmploymentActionButtons {...props} />
      </FormSection>
    </$Accordion>
  );
};

export default EmploymentAccordion;

