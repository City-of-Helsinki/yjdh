import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import { HandledAplication } from 'benefit/handler/types/application';
import { Button, Dialog, IconTrash, TextArea } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { useState } from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';

type ComponentProps = {
  onClose: () => void;
  onSubmit: (handledApplication: HandledAplication) => void;
};

const CancelModalContent: React.FC<ComponentProps> = ({
  onClose,
  onSubmit,
}) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>('');

  const onCommentsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => setMessage(event.target.value);

  return (
    <>
      <Dialog.Content>
        <$Grid>
          <$GridCell $colSpan={12} $rowSpan={3}>
            {t(`${translationsBase}.reasonCancelDialogDescription`)}
          </$GridCell>
          <$GridCell $colSpan={12}>
            <TextArea
              id="proccessRejectedComments"
              name="proccessRejectedComments"
              label={t(`${translationsBase}.reasonCancelLabel`)}
              placeholder={t(`${translationsBase}.reasonCancelPlaceholder`)}
              onChange={onCommentsChange}
              value={message}
              required
            />
          </$GridCell>
        </$Grid>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          theme="black"
          variant="secondary"
          onClick={onClose}
          data-testid="cancel"
        >
          {t('common:applications.actions.close')}
        </Button>
        <Button
          theme="coat"
          variant="danger"
          onClick={() =>
            onSubmit({
              status: APPLICATION_STATUSES.CANCELLED,
              logEntryComment: message,
            })
          }
          disabled={!message}
          data-testid="submit"
          iconLeft={<IconTrash />}
        >
          {t(`${translationsBase}.reasonCancelConfirm`)}
        </Button>
      </Dialog.ActionButtons>
    </>
  );
};

export default CancelModalContent;
