import CredentialsIngress from 'benefit/applicant/components/credentialsIngress/CredentialsIngress';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import {
  Button,
  IconArrowRight,
  IconDocument,
  IconPenLine,
  IconPrinter,
} from 'hds-react';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
  $Hr,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import StepperActions from '../stepperActions/StepperActions';
import CredentialsSection from './credentialsSection/CredentialsSection';
import { useApplicationFormStep5 } from './useApplicationFormStep5';

const ApplicationFormStep5: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const { t, handleBack, handleNext, translationsBase } =
    useApplicationFormStep5(data);
  const theme = useTheme();

  // temporary disabled feature
  const hasElectronicPowerOfAttorney = false;

  return (
    <>
      <CredentialsIngress />
      <$Grid>
        {hasElectronicPowerOfAttorney && (
          <$GridCell $colSpan={6}>
            <CredentialsSection
              title={t(`${translationsBase}.electronicPowerOfAttorney.title`)}
              description={t(
                `${translationsBase}.electronicPowerOfAttorney.description`
              )}
              icon={<IconPenLine size="l" />}
              actions={
                <Button
                  theme="black"
                  variant="secondary"
                  iconRight={<IconArrowRight />}
                >
                  {t(`${translationsBase}.electronicPowerOfAttorney.action1`)}
                </Button>
              }
            />
          </$GridCell>
        )}
        <$GridCell $colSpan={6}>
          <CredentialsSection
            title={t(`${translationsBase}.uploadPowerOfAttorney.title`)}
            description={t(
              `${translationsBase}.uploadPowerOfAttorney.description`
            )}
            icon={<IconDocument size="l" />}
            actions={
              <$Grid>
                <$GridCell $colSpan={4}>
                  <Button
                    theme="black"
                    variant="secondary"
                    iconLeft={<IconPrinter />}
                  >
                    {t(`${translationsBase}.uploadPowerOfAttorney.action1`)}
                  </Button>
                </$GridCell>
                <$GridCell $colSpan={6}>
                  <Button
                    theme="black"
                    variant="secondary"
                    iconLeft={<IconArrowRight />}
                  >
                    {t(`${translationsBase}.uploadPowerOfAttorney.action2`)}
                  </Button>
                </$GridCell>
              </$Grid>
            }
          />
        </$GridCell>
      </$Grid>
      <$Hr
        css={`
          margin-bottom: ${theme.spacing.l};
        `}
      />
      <StepperActions
        hasNext
        handleSubmit={handleNext}
        handleBack={handleBack}
      />
    </>
  );
};

export default ApplicationFormStep5;
