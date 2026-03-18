import {
  $CalculatorContainer,
  $DecisionCalculatorAccordion,
  $DecisionCalculatorAccordionIconContainer,
} from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion.sc';
import { Application } from 'benefit-shared/types/application';
import { Accordion, IconOccupation, IconCheck, IconCrossCircle } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell, $Section} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';
import {
  ATTACHMENT_TYPES
} from 'benefit-shared/constants';

import SetInstalmentToPendingButton
  from "./SetInstalmentToPendingButton";
import SetInstalmentToAcceptedButton
  from "./SetInstalmentToAcceptedButton";

import UploadAttachmentButton from './UploadAttachmentButton';
import { useApplicationReview } from '../useApplicationReview';

type Props = {
  data: Application;
};

const PaidSalariesAccordion: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { handleUpload, isUploading } = useApplicationReview();

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
        <$GridCell
          $colSpan={64}
          style={{
            padding: theme.spacing.m,
          }}
        >
            <$Section>
            <>
              <div>
                <span>{data.employerAssurance ? <IconCheck /> : <IconCrossCircle />}</span>
                <span>{t('common:applications.paidSalaries.assurance')}</span>
              </div>
              {data.attachments.map((attachment) =>
                attachment.attachmentType === ATTACHMENT_TYPES.PAYSLIP ? (
                  <div key={attachment.attachmentFileId}>
                    <a href={attachment.attachmentFile}>
                      {attachment.attachmentFileName}
                    </a>
                  </div>
                ) : null
              )}
            </>
            </$Section>
          <SetInstalmentToPendingButton application={data}/>
          <SetInstalmentToAcceptedButton application={data}/>
          <UploadAttachmentButton
            application={data}
            onUpload={(formData) => handleUpload(data?.applicationId, formData)}
            isUploading={isUploading}
          />
        </$GridCell>
      </Accordion>
    </$DecisionCalculatorAccordion>
  );
};

export default PaidSalariesAccordion;
