import {
  $DecisionCalculatorAccordion,
  $DecisionCalculatorAccordionIconContainer,
} from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion.sc';
import { Application } from 'benefit-shared/types/application';
import { Accordion, IconOccupation } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {$Grid, $GridCell, $Section} from 'shared/components/forms/section/FormSection.sc';

import {
  ATTACHMENT_TYPES
} from 'benefit-shared/constants';

import SetInstalmentToPendingButton
  from "./SetInstalmentToPendingButton";
import SetInstalmentToAcceptedButton
  from "./SetInstalmentToAcceptedButton";

import UploadAttachmentButton from './UploadAttachmentButton';
import { useApplicationReview } from '../useApplicationReview';
import useChangeEmployerAssurance from "benefit/handler/hooks/useChangeEmployerAssurance";
import {$CalculatorTableRow} from "benefit/handler/components/applicationReview/ApplicationReview.sc";
import useRemoveAttachmentQuery from "benefit/handler/hooks/useRemoveAttachmentQuery";
import useUploadAttachmentQuery from "benefit/handler/hooks/useUploadAttachmentQuery";

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

  const changeEmployerAssurance = (nextValue: boolean | null): void => {
    if (!data.id) {
      return;
    }

    updateApplication.mutate({
        ...data,
        employerAssurance: nextValue,
    })
  }

  const handleEmployerAssuranceChange = () => {
    if (!data.id) {
    }

    const nextValue = !employerAssurance;
    setEmployerAssurance(nextValue);
    changeEmployerAssurance(nextValue);
  };

  const removeAttachment = useRemoveAttachmentQuery();

  const handleDeleteAttachment = (attachmentId: string) :void => {
    if (!attachmentId) {
      return;
    }

    removeAttachment.mutate({
      applicationId: data.id,
      attachmentId: attachmentId,
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
            <>
              <div>
                <span><input type="checkbox"
                           checked={employerAssurance}
                           onChange={handleEmployerAssuranceChange}/></span>
                <span>{t('common:applications.paidSalaries.assurance')}</span>
              </div>
            </>
          </$Section>
        </$CalculatorTableRow>

          {data.attachments.map((attachment) =>
            attachment.attachmentType === ATTACHMENT_TYPES.PAYSLIP ? (
              <$CalculatorTableRow>
                <$GridCell colSpan={32}
                           key={attachment.id}>
                  <a href={attachment.attachmentFile}>
                    {attachment.attachmentFileName}
                  </a>
                </$GridCell>
                <$GridCell colSpan={24}>
                  <button
                    onClick={() => handleDeleteAttachment(attachment.id)}
                  >
                    {t('common:applications.paidSalaries.buttons.delete')}
                  </button>
                </$GridCell>
              </$CalculatorTableRow>
            ) : null
          )}
        <$Grid css={{ marginTop: '16px'}}>
          <$GridCell colSpan={32}>
            <SetInstalmentToPendingButton application={data}/>
          </$GridCell>
          <$GridCell colSpan={32}>
            <SetInstalmentToAcceptedButton application={data}/>
          </$GridCell>
          <$GridCell colSpan={64}>
            <UploadAttachmentButton
              onUpload={(formData) =>
                uploadAttachment.mutate({
                  applicationId: data.id,
                  data: formData,
                })
              }
              isUploading={uploadAttachment.isUploading}
            />
          </$GridCell>
        </$Grid>
      </Accordion>
    </$DecisionCalculatorAccordion>
  );
};

export default PaidSalariesAccordion;
