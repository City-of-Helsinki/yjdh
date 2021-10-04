import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import * as React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import StepperActions from '../stepperActions/StepperActions';
import { useApplicationFormStep6 } from './useApplicationFormStep6';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ApplicationFormStep6: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  type TextProp = 'textFi' | 'textEn' | 'textSv';
  type TermsProp = 'termsPdfFi' | 'termsPdfEn' | 'termsPdfSv';

  const {
    handleSubmit,
    handleBack,
    handleClick,
    getErrorText,
    handleDocumentLoadSuccess,
    cbPrefix,
    textLocale,
    checkedArray,
  } = useApplicationFormStep6(data);
  // todo: implement resizing for pdf reader (f. ex. react-sizeme) and pagination
  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection>
        <>
          {data && (
            <$GridCell $colSpan={12}>
              <Document
                onLoadSuccess={handleDocumentLoadSuccess}
                file={
                  data.applicantTermsInEffect[
                    `termsPdf${textLocale}` as TermsProp
                  ]
                }
              >
                <Page pageNumber={1} />
              </Document>
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
        hasBack
        handleSubmit={handleSubmit}
        handleBack={handleBack}
      />
    </form>
  );
};

export default ApplicationFormStep6;
