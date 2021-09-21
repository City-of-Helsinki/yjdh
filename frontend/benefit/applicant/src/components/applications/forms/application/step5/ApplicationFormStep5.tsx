import { $Button } from 'benefit/applicant/components/applications/Applications.sc';
import AttachmentItem from 'benefit/applicant/components/applications/attachmentItem/AttachmentItem';
import UploadAttachment from 'benefit/applicant/components/applications/uploadAttachment/UploadAttachment';
import CredentialsIngress from 'benefit/applicant/components/credentialsIngress/CredentialsIngress';
import {
  ATTACHMENT_MAX_SIZE,
  ATTACHMENT_TYPES,
} from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import {
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
  const {
    t,
    handleBack,
    handleNext,
    translationsBase,
    attachment,
    isRemoving,
    handleRemoveAttachment,
  } = useApplicationFormStep5(data);
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
                <$Button variant="secondary" iconRight={<IconArrowRight />}>
                  {t(`${translationsBase}.electronicPowerOfAttorney.action1`)}
                </$Button>
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
                {attachment ? (
                  <$GridCell>
                    <AttachmentItem
                      id={attachment.id}
                      name={attachment.attachmentFileName}
                      removeText={t(
                        `common:applications.sections.attachments.remove`
                      )}
                      onClick={() =>
                        // eslint-disable-next-line security/detect-non-literal-fs-filename
                        window
                          .open(attachment.attachmentFile, '_blank')
                          ?.focus()
                      }
                      onRemove={() =>
                        !isRemoving && handleRemoveAttachment(attachment.id)
                      }
                    />
                  </$GridCell>
                ) : (
                  <>
                    <$GridCell $colSpan={4}>
                      <$Button variant="secondary" iconLeft={<IconPrinter />}>
                        {t(`${translationsBase}.uploadPowerOfAttorney.action1`)}
                      </$Button>
                    </$GridCell>
                    <$GridCell $colSpan={6}>
                      <UploadAttachment
                        applicationId={data.id || ''}
                        attachmentType={ATTACHMENT_TYPES.EMPLOYEE_CONSENT}
                        allowedFileTypes={['application/pdf']}
                        maxSize={ATTACHMENT_MAX_SIZE}
                        uploadText={t(
                          `${translationsBase}.uploadPowerOfAttorney.action2`
                        )}
                        variant="secondary"
                        icon={<IconArrowRight />}
                      />
                    </$GridCell>
                  </>
                )}
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
