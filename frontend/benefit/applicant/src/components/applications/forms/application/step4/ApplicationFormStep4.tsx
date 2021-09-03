import { $SupplementaryButton } from 'benefit/applicant/components/applications/Applications.sc';
import { useTranslation } from 'benefit/applicant/i18n';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { IconPen } from 'hds-react';
import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import FormSection from 'shared/components/forms/section/FormSection';

import StepperActions from '../stepperActions/StepperActions';
import { useApplicationFormStep4 } from './useApplicationFormStep4';

const ApplicationFormStep4: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  const { handleBack, handleNext, handleStepChange } = useApplicationFormStep4(
    data
  );
  const translationsBase = 'common:applications.sections';
  // console.log(data);
  return (
    <>
      <FormSection
        action={
          <$SupplementaryButton
            onClick={() => handleStepChange(1)}
            variant="supplementary"
            iconLeft={<IconPen />}
          >
            {t(`common:applications.actions.edit`)}
          </$SupplementaryButton>
        }
      >
        <Heading as="h2" header={t(`${translationsBase}.company.heading1`)} />
        <Heading
          as="h2"
          header={t(`${translationsBase}.company.heading2Short`)}
        />
        <Heading as="h2" header={t(`${translationsBase}.company.heading3`)} />
      </FormSection>
      <FormSection
        action={
          <$SupplementaryButton
            onClick={() => handleStepChange(2)}
            variant="supplementary"
            iconLeft={<IconPen />}
          >
            {t(`common:applications.actions.edit`)}
          </$SupplementaryButton>
        }
      >
        <Heading
          as="h2"
          header={t(`${translationsBase}.employee.heading1Short`)}
        />
        <Heading as="h2" header={t(`${translationsBase}.employee.heading2`)} />
        <Heading
          as="h2"
          header={t(`${translationsBase}.employee.heading3Long`)}
        />
      </FormSection>
      <FormSection
        action={
          <$SupplementaryButton
            onClick={() => handleStepChange(3)}
            variant="supplementary"
            iconLeft={<IconPen />}
          >
            {t(`common:applications.actions.edit`)}
          </$SupplementaryButton>
        }
      >
        <Heading
          as="h2"
          header={t(`${translationsBase}.attachments.heading1`)}
        />
      </FormSection>
      <StepperActions
        hasBack
        hasNext
        handleSubmit={handleNext}
        handleBack={handleBack}
      />
    </>
  );
};

export default ApplicationFormStep4;
