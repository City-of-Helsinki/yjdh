import useInstalmentStatusTransition from 'benefit/handler/hooks/useInstalmentStatusTransition';
import { INSTALMENT_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

type Props = {
  application: Application;
};

const SetInstalmentToAcceptedButton: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const mutation = useInstalmentStatusTransition();

  const handleClick = (): void => {
    if (!application.secondInstalment?.id) {
      return;
    }

    mutation.mutate({
      id: application.secondInstalment.id,
      status: INSTALMENT_STATUSES.ACCEPTED,
    });
  };

  // Only show button if second instalment exists and is not already pending
  if (
    !application.secondInstalment ||
    application.secondInstalment.status === INSTALMENT_STATUSES.ACCEPTED
  ) {
    return null;
  }

  return (
    <Button
      theme="black"
      variant="secondary"
      onClick={handleClick}
      disabled={mutation.isLoading}
    >
      {mutation.isLoading
        ? t('common:utility.loading')
        : t('common:applications.paidSalaries.buttons.accept')}
    </Button>
  );
};

export default SetInstalmentToAcceptedButton;
