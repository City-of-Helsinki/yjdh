import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import * as React from 'react';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import StepperActions from '../stepperActions/StepperActions';
import { useApplicationFormStep6 } from './useApplicationFormStep6';

const ApplicationFormStep6: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  type TextProp = 'textFi' | 'textEn' | 'textSv';

  const {
    t,
    handleSubmit,
    handleBack,
    handleClick,
    getErrorText,
    translationsBase,
    cbPrefix,
    textLocale,
    checkedArray,
  } = useApplicationFormStep6(data);

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <FormSection header={t(`${translationsBase}.heading1`)}>
          {data?.applicantTermsInEffect?.applicantConsents.map((consent, i) => (
            <$GridCell $colSpan={12} key={consent.id}>
              <$Checkbox
                id={`${cbPrefix}_${consent.id}`}
                name={`${cbPrefix}_${i}`}
                label={consent[`text${textLocale}` as TextProp] || ''}
                required
                checked={checkedArray[i]}
                errorText={getErrorText(i)}
                aria-invalid={false}
                onChange={() => handleClick(i)}
              />
            </$GridCell>
          ))}
        </FormSection>
        <StepperActions
          disabledNext={checkedArray.some((c) => !c)}
          hasBack
          handleSubmit={handleSubmit}
          handleBack={handleBack}
        />
      </form>
    </>
  );
};

export default ApplicationFormStep6;
