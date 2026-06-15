import PdfViewer from 'benefit/applicant/components/pdfViewer/PdfViewer';
import { $Markdown } from 'benefit/applicant/components/termsOfService/TermsOfService';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { TextProp } from 'benefit-shared/types/application';
import { ButtonPresetTheme, ButtonVariant } from 'hds-react';
import * as React from 'react';
import Button from 'shared/components/button/Button';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { openFileInNewTab } from 'shared/utils/file.utils';

import StepperActions from '../stepperActions/StepperActions';
import { useApplicationFormStep6 } from './useApplicationFormStep6';

type ExtendedProps = {
  setIsSubmittedApplication: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResubmission?: React.Dispatch<React.SetStateAction<boolean>>;
};

const ApplicationFormStep6: React.FC<
  DynamicFormStepComponentProps & ExtendedProps
> = ({ data, setIsSubmittedApplication, setIsResubmission }) => {
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
    applicantTermsInEffectUrl,
    applicantTerms2InEffectUrl,
    applicantTerms3InEffectUrl,
    applicantTerms4InEffectUrl,
    applicantTermsInEffectMd,
    checkedArray,
  } = useApplicationFormStep6(
    data,
    setIsSubmittedApplication,
    setIsResubmission
  );

  const allApplicantTermsInEffect = [
    applicantTermsInEffectUrl,
    applicantTerms2InEffectUrl,
    applicantTerms3InEffectUrl,
    applicantTerms4InEffectUrl,
  ]

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection>
        <>
          <$GridCell $colSpan={12}>
            {t('common:applications.sections.applicantTerms.explanation')
              .split(/\n+/)
              .map((line) => (
                <p key={line.replace(/^[A-Za-z]/, '')}>{line}</p>
              ))}
          </$GridCell>
          {data && (
            <>
              {applicantTermsInEffectMd ? (
                <$GridCell $colSpan={12}>
                  <$Markdown>{applicantTermsInEffectMd}</$Markdown>
                </$GridCell>
              ) : null}
              {allApplicantTermsInEffect.map((url, index) =>
                url && url.length > 0 ? (
                  <React.Fragment key={url}>
                    <$GridCell
                      $colSpan={12}
                      css={`
                        margin-bottom: var(--spacing-5-xl);
                      `}
                    >
                      <PdfViewer file={url} scale={1} />
                    </$GridCell>

                    <$GridCell
                      $colSpan={6}
                      css={`
                        margin-bottom: var(--spacing-l);
                      `}
                    >
                      <Button
                        theme={ButtonPresetTheme.Black}
                        variant={ButtonVariant.Secondary}
                        onClick={() => openFileInNewTab(url)}
                      >
                        {t(
                          `common:applications.sections.applicantTerms.openTerms.${
                            index + 1
                          }`
                        )}
                      </Button>
                    </$GridCell>
                  </React.Fragment>
                ) : null
              )}
            </>
          )}

          {data?.applicantTermsInEffect?.applicantConsents.map((consent, i) => (
            <$GridCell $colSpan={12} key={consent.id}>
              <$Checkbox
                data-testid="application-terms-consent"
                id={`${cbPrefix}_${consent.id}`}
                name={`${cbPrefix}_${i}`}
                label={(consent[`text${textLocale}` as TextProp] || '')
                  .split(/\\n/)
                  .map((line) => (
                    <React.Fragment key={`${consent.id}-${line}`}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
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
        applicationStatus={data?.status ?? APPLICATION_STATUSES.DRAFT}
        lastStep
      />
    </form>
  );
};

export default ApplicationFormStep6;
