import { $SecondaryDangerButton } from 'benefit/handler/components/applicationReview/handlingView/AlterationAccordionItem.sc';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import { ApplicationAlteration } from 'benefit-shared/types/application';
import { Button, Dialog, IconInfoCircle, IconTrash } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import theme from 'shared/styles/theme';
import { formatDate } from 'shared/utils/date.utils';

type Props = {
  onClose: () => void;
  onSetCancelled: () => void;
  isOpen: boolean;
  isDeleting: boolean;
  alteration: ApplicationAlteration;
};

const AlterationCancelModal = ({
  onClose,
  onSetCancelled,
  isOpen,
  isDeleting,
  alteration,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Modal
      theme={theme.components.modal.danger}
      id="ActionBar-confirmEditApplicationModal"
      isOpen={isOpen}
      title={t(
        `common:applications.decision.alterationList.cancelModal.title${
          alteration.alterationType === ALTERATION_TYPE.TERMINATION
            ? 'Termination'
            : 'Suspension'
        }`,
        {
          endDate: formatDate(new Date(alteration.endDate)),
          resumeDate: alteration.resumeDate
            ? formatDate(new Date(alteration.resumeDate))
            : '-',
        }
      )}
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
                'common:applications.decision.alterationList.cancelModal.body'
              )}
            </p>
          </Dialog.Content>
          <Dialog.ActionButtons>
            <$SecondaryDangerButton disabled={isDeleting} onClick={onClose}>
              {t(
                'common:applications.decision.alterationList.cancelModal.cancel'
              )}
            </$SecondaryDangerButton>
            <Button
              theme="coat"
              variant="danger"
              iconLeft={<IconTrash />}
              onClick={onSetCancelled}
              disabled={isDeleting}
              isLoading={isDeleting}
              loadingText={t('common:utility.deleting')}
            >
              {t(
                `common:applications.decision.alterationList.cancelModal.setCancelled`
              )}
            </Button>
          </Dialog.ActionButtons>
        </>
      }
    />
  );
};

export default AlterationCancelModal;
