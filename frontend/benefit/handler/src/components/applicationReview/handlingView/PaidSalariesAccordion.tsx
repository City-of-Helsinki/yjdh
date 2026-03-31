import { $CalculatorTableRow } from 'benefit/handler/components/applicationReview/ApplicationReview.sc';
import useChangeEmployerAssurance from 'benefit/handler/hooks/useChangeEmployerAssurance';
import useInstalmentStatusTransitions from 'benefit/handler/hooks/useInstalmentStatusTransition'
import useRemoveAttachmentQuery from 'benefit/handler/hooks/useRemoveAttachmentQuery';
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
      <$Grid>
        {data.secondInstalment?.status !== INSTALMENT_STATUSES.PENDING && (
          <$GridCell $colSpan={32}>
            <Button
              key="set-pending-button"
              onClick={handleSetPending}>
              {t('common:applications.paidSalaries.buttons.setPending')}
            </Button>
          </$GridCell>
        )}

        {data.secondInstalment?.status !== INSTALMENT_STATUSES.ACCEPTED && (
          <$GridCell $colSpan={32}>
            <Button
              key="set-accepted-button"
              onClick={handleSetAccepted}>
              {t('common:applications.paidSalaries.buttons.setAccepted')}
            </Button>
          </$GridCell>
        )}
      </$Grid>
    </>
  );
};

export default PaidSalariesAccordion;
