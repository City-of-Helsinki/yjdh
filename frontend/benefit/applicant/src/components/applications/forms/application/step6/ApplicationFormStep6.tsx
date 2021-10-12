import PdfViewver from 'benefit/applicant/components/pdfViewer/PdfViewer';
import { TermsProp, TextProp } from 'benefit/applicant/types/application';
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
  const {
    handleSubmit,
    handleSave,
    handleBack,
    handleClick,
    getErrorText,
    cbPrefix,
    textLocale,
    checkedArray,
  } = useApplicationFormStep6(data);

  // todo: implement resizing for pdf reader (f. ex. react-sizeme), styling as in design
  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection>
        <>
          {data && (
            <$GridCell $colSpan={12}>
              <PdfViewver
                file={
                  (data.applicantTermsInEffect &&
                    data.applicantTermsInEffect[
                      `termsPdf${textLocale}` as TermsProp
                    ]) ||
                  ''
                }
              />
            </$GridCell>
          )}
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
        </>
      </FormSection>
      <StepperActions
        disabledNext={checkedArray.some((c) => !c)}
        handleSubmit={handleSubmit}
        handleSave={handleSave}
        handleBack={handleBack}
        lastStep
      />
    </form>
  );
};

export default ApplicationFormStep6;
