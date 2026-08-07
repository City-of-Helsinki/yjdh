import { useTranslation } from 'benefit/applicant/i18n';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import { ApplicationAlteration } from 'benefit-shared/types/application';
import {
  ButtonPresetTheme,
  ButtonVariant,
  Dialog,
  IconInfoCircle,
  IconTrash,
} from 'hds-react';
import noop from 'lodash/noop';
import React from 'react';
import Button from 'shared/components/button/Button';
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
}: Props): React.ReactElement => {
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
      submitButtonLabel=""
      cancelButtonLabel=""
      handleToggle={noop}
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
              theme={ButtonPresetTheme.Coat}
              iconStart={<IconTrash />}
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
              theme={ButtonPresetTheme.Coat}
              variant={ButtonVariant.Secondary}
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
