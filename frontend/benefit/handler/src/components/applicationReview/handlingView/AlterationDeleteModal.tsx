import { $SecondaryDangerButton } from 'benefit/handler/components/applicationReview/handlingView/AlterationAccordionItem.sc';
import { Button, Dialog, IconInfoCircle, IconTrash } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import theme from 'shared/styles/theme';

type Props = {
  onClose: () => void;
  onDelete: () => void;
  isOpen: boolean;
  isDeleting: boolean;
};

const AlterationDeleteModal = ({
  onClose,
  onDelete,
  isOpen,
  isDeleting,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Modal
      theme={theme.components.modal.danger}
      id="ActionBar-confirmEditApplicationModal"
      isOpen={isOpen}
      title={t('common:applications.decision.alterationList.deleteModal.title')}
      submitButtonLabel=""
      cancelButtonLabel=""
      handleToggle={null}
      handleSubmit={noop}
      headerIcon={<IconInfoCircle />}
      customContent={
        <>
          <Dialog.Content>
            <p>
              {t(
                'common:applications.decision.alterationList.deleteModal.body'
              )}
            </p>
          </Dialog.Content>
          <Dialog.ActionButtons>
            <$SecondaryDangerButton disabled={isDeleting} onClick={onClose}>
              {t(
                'common:applications.decision.alterationList.deleteModal.cancel'
              )}
            </$SecondaryDangerButton>
            <Button
              theme="coat"
              variant="danger"
              iconLeft={<IconTrash />}
              onClick={onDelete}
              disabled={isDeleting}
              isLoading={isDeleting}
              loadingText={t('common:utility.deleting')}
            >
              {t(
                `common:applications.decision.alterationList.deleteModal.delete`
              )}
            </Button>
          </Dialog.ActionButtons>
        </>
      }
    />
  );
};

export default AlterationDeleteModal;
