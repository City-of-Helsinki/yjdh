import { ApplicationAlterationHandlingForm } from 'benefit/handler/types/application';
import { Button, Dialog, IconInfoCircle } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import theme from 'shared/styles/theme';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

type Props = {
  onClose: () => void;
  onSubmit: () => void;
  isOpen: boolean;
  isWorking: boolean;
  values: ApplicationAlterationHandlingForm;
};

const AlterationHandlingConfirmationModal = ({
  onClose,
  onSubmit,
  isOpen,
  values,
  isWorking,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  if (!values) {
    return null;
  }

  const translationBase = `common:applications.alterations.handling.confirmation.${
    values.isRecoverable ? 'recoverable' : 'nonrecoverable'
  }`;

  return (
    <Modal
      theme={theme.components.modal.coat}
      id="ActionBar-confirmEditApplicationModal"
      isOpen={isOpen}
      title={t(`${translationBase}.title`)}
      submitButtonLabel=""
      cancelButtonLabel=""
      handleToggle={null}
      handleSubmit={noop}
      headerIcon={<IconInfoCircle />}
      customContent={
        <>
          <Dialog.Content>
            <p>
              {t(`${translationBase}.description`, {
                startDate: values.recoveryStartDate,
                endDate: values.recoveryEndDate,
                amount: formatFloatToCurrency(values.recoveryAmount),
              })}
            </p>
          </Dialog.Content>
          <Dialog.ActionButtons>
            <Button
              theme="coat"
              onClick={onSubmit}
              disabled={isWorking}
              isLoading={isWorking}
              loadingText={t('common:utility.submitting')}
            >
              {t('common:utility.confirm')}
            </Button>
            <Button
              theme="coat"
              variant="secondary"
              disabled={isWorking}
              onClick={onClose}
            >
              {t('common:utility.cancel')}
            </Button>
          </Dialog.ActionButtons>
        </>
      }
    />
  );
};

export default AlterationHandlingConfirmationModal;
