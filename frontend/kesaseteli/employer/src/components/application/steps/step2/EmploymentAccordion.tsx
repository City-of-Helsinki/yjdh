import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import useApplicationForm from 'kesaseteli/employer/hooks/application/useApplicationForm';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {useWatch} from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import Employment from 'shared/types/Employment';
import { isEmpty } from 'shared/utils/string.utils';

import { $Accordion, $EmploymentFormGrid } from './EmploymentAccordion.sc';

type Props = {
  employment: Employment,
  index: number
}

const EmploymentAccordion: React.FC<Props> = ({employment, index}: Props) => {

  const { t } = useTranslation();
  const defaultHeading = `${t(`common:application.step2.employment`)} #${index + 1}`
  const { control } = useApplicationForm();
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
    </$Accordion>
  );
};

export default EmploymentAccordion;

