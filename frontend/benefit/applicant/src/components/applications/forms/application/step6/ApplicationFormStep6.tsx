import PdfViewer from 'benefit/applicant/components/pdfViewer/PdfViewer';
import { $Markdown } from 'benefit/applicant/components/termsOfService/TermsOfService';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { TextProp } from 'benefit-shared/types/application';
import { Button } from 'hds-react';
import * as React from 'react';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { openFileInNewTab } from 'shared/utils/file.utils';

import StepperActions from '../stepperActions/StepperActions';
import { useApplicationFormStep6 } from './useApplicationFormStep6';

type ExtendedProps = {
  onSubmit?: () => void;
};

const ApplicationFormStep6: React.FC<
  DynamicFormStepComponentProps & ExtendedProps
> = ({ data, onSubmit }) => {
  const {
    t,
    handleSubmit,
    handleSave,
    handleBack,
    handleDelete,
    handleClick,
    getErrorText,
    cbPrefix,
    textLocale,
    checkedArray,
    applicantTermsInEffectUrl,
    applicantTermsInEffectMd,
  } = useApplicationFormStep6(data, onSubmit);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection>
        <>
          {data && (
            <>
              {applicantTermsInEffectMd ? (
                <$GridCell $colSpan={12}>
                  <$Markdown>{applicantTermsInEffectMd}</$Markdown>
                </$GridCell>
              ) : null}
              {applicantTermsInEffectUrl.length > 0 ? (
                <>
                  <$GridCell $colSpan={12}>
                    <PdfViewer file={applicantTermsInEffectUrl} scale={1.8} />
                  </$GridCell>

                  <$GridCell
                    $colSpan={5}
                    css={`
                      margin-bottom: var(--spacing-l);
                    `}
                  >
                    <Button
                      theme="black"
                      variant="secondary"
                      onClick={() =>
                        openFileInNewTab(applicantTermsInEffectUrl)
                      }
                    >
                      {t('common:applications.actions.openTermsAsPDF')}
                    </Button>
                  </$GridCell>
                </>
              ) : null}
            </>
          )}
          {data?.applicantTermsInEffect?.applicantConsents.map((consent, i) => (
            <$GridCell $colSpan={12} key={consent.id}>
              <$Checkbox
                data-testid="application-terms-consent"
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
        handleDelete={handleDelete}
        lastStep
      />
    </form>
  );
};

export default ApplicationFormStep6;
