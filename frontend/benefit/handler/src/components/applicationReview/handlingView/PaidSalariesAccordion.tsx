import { $CalculatorTableRow } from 'benefit/handler/components/applicationReview/ApplicationReview.sc';
import {
  $DecisionCalculatorAccordion,
  $DecisionCalculatorAccordionIconContainer,
} from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion.sc';
import useChangeEmployerAssurance from 'benefit/handler/hooks/useChangeEmployerAssurance';
import useRemoveAttachmentQuery from 'benefit/handler/hooks/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'benefit/handler/hooks/useUploadAttachmentQuery';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Accordion, Button, IconOccupation } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
  $Section,
} from 'shared/components/forms/section/FormSection.sc';

import SetInstalmentToAcceptedButton from './SetInstalmentToAcceptedButton';
import SetInstalmentToPendingButton from './SetInstalmentToPendingButton';
import UploadAttachmentButton from './UploadAttachmentButton';

type Props = {
  data: Application;
};

const PaidSalariesAccordion: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const updateApplication = useChangeEmployerAssurance();
  const [employerAssurance, setEmployerAssurance] = React.useState(
    Boolean(data.employerAssurance)
  );

  React.useEffect(() => {
    setEmployerAssurance(Boolean(data.employerAssurance));
  }, [data.employerAssurance]);

  const uploadAttachment = useUploadAttachmentQuery();
  const isUploading = Boolean(uploadAttachment.isLoading);

  const changeEmployerAssurance = (nextValue: boolean | null): void => {
    if (!data.id) {
      return;
    }

    updateApplication.mutate({
      ...data,
      employer_assurance: nextValue,
    });
  };

  const handleEmployerAssuranceChange = (): void => {
    if (!data.id) {
      return;
    }

    const nextValue = !employerAssurance;
    setEmployerAssurance(nextValue);
    changeEmployerAssurance(nextValue);
  };

  const removeAttachment = useRemoveAttachmentQuery();

  const handleDeleteAttachment = (attachmentId: string): void => {
    if (!data.id || !attachmentId) {
      return;
    }

    removeAttachment.mutate({
      applicationId: data.id,
      attachmentId,
    });
  };

  return (
    <$DecisionCalculatorAccordion>
      <$DecisionCalculatorAccordionIconContainer aria-hidden="true">
        <IconOccupation />
      </$DecisionCalculatorAccordionIconContainer>
      <Accordion
        heading={t('common:applications.paidSalaries.heading')}
        card
        size="s"
      >
        <$CalculatorTableRow>
          <$Section>
            <div>
              <span>
                <input
                  type="checkbox"
                  checked={employerAssurance}
                  onChange={handleEmployerAssuranceChange}
                />
              </span>
              <span>{t('common:applications.paidSalaries.assurance')}</span>
            </div>
          </$Section>
        </$CalculatorTableRow>

        {data.attachments.map((attachment) =>
          attachment.attachmentType === ATTACHMENT_TYPES.PAYSLIP ? (
            <$CalculatorTableRow key={attachment.id}>
              <$GridCell colSpan={32}>
                <a href={attachment.attachmentFile}>
                  {attachment.attachmentFileName}
                </a>
              </$GridCell>
              <$GridCell colSpan={24}>
                <Button onClick={() => handleDeleteAttachment(attachment.id)}>
                  {t('common:applications.paidSalaries.buttons.delete')}
                </Button>
              </$GridCell>
            </$CalculatorTableRow>
          ) : null
        )}

        <$Grid css={{ marginTop: '16px' }}>
          <$GridCell colSpan={32}>
            <SetInstalmentToPendingButton application={data} />
          </$GridCell>
          <$GridCell colSpan={32}>
            <SetInstalmentToAcceptedButton application={data} />
          </$GridCell>
          <$GridCell colSpan={64}>
            <UploadAttachmentButton
              applicationId={data.id}
              onUpload={(formData) => {
                if (!data.id) {
                  return;
                }

                uploadAttachment.mutate({
                  applicationId: data.id,
                  data: formData,
                });
              }}
              isUploading={isUploading}
            />
          </$GridCell>
        </$Grid>
      </Accordion>
    </$DecisionCalculatorAccordion>
  );
};

export default PaidSalariesAccordion;
