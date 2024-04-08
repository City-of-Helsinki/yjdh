import { useTranslation } from 'benefit/applicant/i18n';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import { ApplicationAlteration } from 'benefit-shared/types/application';
import { Button, Dialog, IconInfoCircle, IconTrash } from 'hds-react';
import noop from 'lodash/noop';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import theme from 'shared/styles/theme';

type Props = {
  onClose: () => void;
  onDelete: () => void;
  isOpen: boolean;
  isDeleting: boolean;
  alteration: ApplicationAlteration;
};

const AlterationDeleteModal = ({
  onClose,
  onDelete,
  isOpen,
  alteration,
  isDeleting,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Modal
      theme={theme.components.modal.coat}
      id="ActionBar-confirmEditApplicationModal"
      isOpen={isOpen}
      title={t(
        `common:applications.decision.alterationList.deleteModal.title${
          alteration.alterationType === ALTERATION_TYPE.TERMINATION
            ? 'Termination'
            : 'Suspension'
        }`
      )}
      submitButtonLabel={t(`common.save`)}
      cancelButtonLabel={t(`common.backWithoutBack`)}
      handleToggle={null}
      handleSubmit={noop}
      headerIcon={<IconInfoCircle />}
      customContent={
        <>
          <Dialog.Content>
            <p>
              {t(
                `common:applications.decision.alterationList.deleteModal.body${
                  alteration.alterationType === ALTERATION_TYPE.TERMINATION
                    ? 'Termination'
                    : 'Suspension'
                }`
              )}
            </p>
          </Dialog.Content>
          <Dialog.ActionButtons>
            <Button
              theme="coat"
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
            <Button
              theme="coat"
              variant="secondary"
              disabled={isDeleting}
              onClick={onClose}
            >
              {t(
                `common:applications.decision.alterationList.deleteModal.cancel`
              )}
            </Button>
          </Dialog.ActionButtons>
        </>
      }
    />
  );
};

export default AlterationDeleteModal;
