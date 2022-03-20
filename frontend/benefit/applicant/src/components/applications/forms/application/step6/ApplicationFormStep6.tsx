import NotificationView from 'benefit/applicant/components/notificationView/NotificationView';
import PdfViewver from 'benefit/applicant/components/pdfViewer/PdfViewer';
import { TextProp } from 'benefit/applicant/types/application';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { Button } from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';

import StepperActions from '../stepperActions/StepperActions';
import { useApplicationFormStep6 } from './useApplicationFormStep6';

type ExtendedProps = {
  isSubmittedApplication?: boolean;
  onSubmit?: () => void;
};

const ApplicationFormStep6: React.FC<
  DynamicFormStepComponentProps & ExtendedProps
> = ({ data, isSubmittedApplication, onSubmit }) => {
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
    openTermsAsPDF,
  } = useApplicationFormStep6(data, onSubmit);

  if (isSubmittedApplication) {
    return (
      <NotificationView
        title={t('common:notifications.applicationSubmitted.label')}
        message={t('common:notifications.applicationSubmitted.message', {
          applicationNumber: data?.applicationNumber,
          applicantName: getFullName(
            data?.employee?.firstName,
            data?.employee?.lastName
          ),
        })}
      />
    );
  }

  // todo: implement resizing for pdf reader (f. ex. react-sizeme), styling as in design
  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection>
        <>
          {data && (
            <>
              <$GridCell $colSpan={12}>
                <PdfViewver
                  file={applicantTermsInEffectUrl}
                  documentMarginLeft="-80px"
                />
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
                  onClick={openTermsAsPDF}
                >
                  {t('common:applications.actions.openTermsAsPDF')}
                </Button>
              </$GridCell>
            </>
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
        handleDelete={handleDelete}
        lastStep
      />
    </form>
  );
};

const defaultProps = {
  isSubmittedApplication: false,
  onSubmit: noop,
};

ApplicationFormStep6.defaultProps = defaultProps;

export default ApplicationFormStep6;
