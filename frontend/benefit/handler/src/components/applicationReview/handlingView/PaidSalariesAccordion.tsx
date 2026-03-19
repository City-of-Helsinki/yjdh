import {
  $DecisionCalculatorAccordion,
  $DecisionCalculatorAccordionIconContainer,
} from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion.sc';
import { Application } from 'benefit-shared/types/application';
import { Accordion, IconOccupation, IconCheck } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $Section} from 'shared/components/forms/section/FormSection.sc';

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

type Props = {
  data: Application;
};

const PaidSalariesAccordion: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const { handleUpload, isUploading } = useApplicationReview();
  const updateApplication = useChangeEmployerAssurance();
  const [employerAssurance, setEmployerAssurance] = React.useState(
    Boolean(data.employerAssurance)
  );

  React.useEffect(() => {
    setEmployerAssurance(Boolean(data.employerAssurance));
  }, [data.employerAssurance]);

  const changeEmployerAssurance = (): void => {
    if (!data.id) {
      return;
    }

    updateApplication.mutate({
        ...data,
        employer_assurance: true,
    })
  }

  const handleEmployerAssuranceChange = () => {
    setEmployerAssurance(!employerAssurance);
    changeEmployerAssurance();
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
                <span>{employerAssurance ? <IconCheck />
                  : <input type="checkbox"
                           checked={employerAssurance}
                           onChange={handleEmployerAssuranceChange}
                   />}</span>
                <span>{t('common:applications.paidSalaries.assurance')}</span>
              </div>
            </>
          </$Section>
        </$CalculatorTableRow>
        <$CalculatorTableRow>
          <$Section>
            {data.attachments.map((attachment) =>
              attachment.attachmentType === ATTACHMENT_TYPES.PAYSLIP ? (
                <div key={attachment.id}>
                  <a href={attachment.attachmentFile}>
                    {attachment.attachmentFileName}
                  </a>
                </div>
              ) : null
            )}
        </$Section>
        </$CalculatorTableRow>
        <SetInstalmentToPendingButton application={data}/>
        <SetInstalmentToAcceptedButton application={data}/>
        <UploadAttachmentButton
          onUpload={(formData) => handleUpload(data?.applicationId, formData)}
          isUploading={isUploading}
        />
      </Accordion>
    </$DecisionCalculatorAccordion>
  );
};

export default PaidSalariesAccordion;
