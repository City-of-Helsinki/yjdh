import { Button, Dialog, IconInfoCircle } from 'hds-react';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';

type Props = {
  isOpen: boolean;
  close: () => void;
};

const InfoDialog: React.FC<Props> = ({ isOpen, close }) => {
  const titleId = 'info-dialog-title';
  const descriptionId = 'info-dialog-content';
  const { t } = useTranslation();

  return (
    <Dialog
      id="info-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      close={close}
      closeButtonLabelText={t('common:editor.close')}
      variant="danger"
    >
      <Dialog.Header
        id={titleId}
        title={t('common:editor.draftInfoHeader')}
        iconLeft={<IconInfoCircle aria-hidden="true" />}
      />
      <Dialog.Content>
        <p id={descriptionId} className="text-body">
          <Trans i18nKey="common:editor.draftInfoContent">
            Täytä <strong>Tehtävänimike</strong>, <strong>toimipiste</strong> ja <strong>osoite</strong> tallentaaksesi
            keskeneräisen ilmoituksen
          </Trans>
        </p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={close} variant="danger">
          {t('common:editor.close')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default InfoDialog;
