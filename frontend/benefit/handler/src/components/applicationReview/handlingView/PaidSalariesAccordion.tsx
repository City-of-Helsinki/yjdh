import { $CalculatorTableRow } from 'benefit/handler/components/applicationReview/ApplicationReview.sc';
import useChangeEmployerAssurance from 'benefit/handler/hooks/useChangeEmployerAssurance';
import useInstalmentStatusTransitions from 'benefit/handler/hooks/useInstalmentStatusTransition'
import useRemoveAttachmentQuery from 'benefit/handler/hooks/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'benefit/handler/hooks/useUploadAttachmentQuery';
import { ATTACHMENT_TYPES, INSTALMENT_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';

type Props = {
  data: Application;
};

const PaidSalariesAccordion: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const { mutate: removeAttachment } = useRemoveAttachmentQuery();
  const { mutate: uploadAttachment } = useUploadAttachmentQuery();
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);
  const [ isEmployerAssurance, setIsEmployerAssurance ] = React.useState(Boolean(data?.employerAssurance));
  const instalmentStatusTransition = useInstalmentStatusTransitions();
  const changeEmployerAssurance = useChangeEmployerAssurance();

  React.useEffect(() => {
    setIsEmployerAssurance(Boolean(data.employerAssurance));
  }, [data.employerAssurance]);

  const handleDeleteAttachment = (attachmentId: string): void => {
    const payload = {
      applicationId: data.id,
      attachmentId,
    }

    removeAttachment(payload);
  }

  const handleEmployerAssuranceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const {checked} = event.target;
    setIsEmployerAssurance(checked);

    if (data.id) {
      changeEmployerAssurance.mutate({
        id: data.id,
        employerAssurance: checked,
      });
    }
  };

  const handleSetPending = (): void => {
    instalmentStatusTransition.mutate({
      id: data.secondInstalment.id,
      status: INSTALMENT_STATUSES.PENDING,
    });
  }

  const handleSetAccepted = (): void => {
    instalmentStatusTransition.mutate({
      id: data.secondInstalment.id,
      status: INSTALMENT_STATUSES.ACCEPTED,
    });
  };

  const handleUploadAttachment = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { files } = event.target;
    const file = files?.[0];

    if (!file || !data.id) {
      return;
    }

    const formData = new FormData();
    formData.append('attachment_file', file);
    formData.append('attachment_type', ATTACHMENT_TYPES.PAYSLIP);

    uploadAttachment({
      applicationId: data.id,
      data: formData,
    });
  };

  return (
    <>
      <$Grid css={{ marginBottom: '24px' }}>
        <$GridCell $colSpan={10}>
          <input
            name="employer-assurance-checkbox"
            type="checkbox"
            checked={isEmployerAssurance}
            onChange={handleEmployerAssuranceChange}
          />
          {t('common:applications.paidSalaries.employerAssurance')}
        </$GridCell>
      </$Grid>
      <$Grid css={{ marginBottom: '24px' }}>
        <$GridCell $colSpan={32}>
          <h2>{t('common:applications.paidSalaries.payslipHeading')}</h2>
        </$GridCell>
      </$Grid>
      {data.attachments.map((attachment) =>
        attachment.attachmentType === ATTACHMENT_TYPES.PAYSLIP ? (
          <$CalculatorTableRow key={attachment.id}>
            <$GridCell $colSpan={32}>
              <a href={attachment.attachmentFile}>
                {attachment.attachmentFileName}
              </a>
            </$GridCell>
            <$GridCell $colSpan={24}>
              <Button onClick={() => handleDeleteAttachment(attachment.id)}>
                {t('common:applications.paidSalaries.buttons.delete')}
              </Button>
            </$GridCell>
          </$CalculatorTableRow>
        ) : null
      )}
      {data.secondInstalment?.status !== INSTALMENT_STATUSES.PENDING && (
        <Button css={{ marginRight: '24px' }} onClick={handleSetPending}>
          {t('common:applications.paidSalaries.buttons.setPending')}
        </Button>
      )}

      {data.secondInstalment?.status !== INSTALMENT_STATUSES.ACCEPTED && (
        <Button css={{ marginRight: '24px' }} onClick={handleSetAccepted}>
          {t('common:applications.paidSalaries.buttons.setAccepted')}
        </Button>
      )}
      <>
        <input
          ref={uploadInputRef}
          id="paid-salaries-upload"
          type="file"
          hidden
          onChange={handleUploadAttachment}
        />
        <Button onClick={() => uploadInputRef.current?.click()}>
          {t('common:applications.paidSalaries.buttons.upload')}
        </Button>
      </>
    </>
  );
};

export default PaidSalariesAccordion;
