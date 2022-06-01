import React from 'react';
import { Button, Dialog, IconInfoCircle } from 'hds-react';

type Props = {
  isOpen: boolean;
  close: () => void;
};

const InfoDialog: React.FC<Props> = ({ isOpen, close }) => {
  const titleId = 'info-dialog-title';
  const descriptionId = 'info-dialog-content';
  return (
    <Dialog
      id="info-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      close={close}
      closeButtonLabelText="Sulje"
    >
      <Dialog.Header id={titleId} title="Täytä vaaditut kentät" iconLeft={<IconInfoCircle aria-hidden="true" />} />
      <Dialog.Content>
        <p id={descriptionId} className="text-body">
          Tehtävänimike, toimipiste ja osoite tulee olla täytettynä keskeneräiseen ilmoitukseen
        </p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={close}>Sulje</Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default InfoDialog;
