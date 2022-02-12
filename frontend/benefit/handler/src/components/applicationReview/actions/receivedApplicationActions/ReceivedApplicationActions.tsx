import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import useUpdateApplicationQuery from 'benefit/handler/hooks/useUpdateApplicationQuery';
import {
  Application,
  ApplicationData,
} from 'benefit/handler/types/application';
import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import snakecaseKeys from 'snakecase-keys';

export type Props = {
  application: Application;
};

const ReceivedApplicationActions: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const { onSaveAndClose } = useHandlerReviewActions(application);

  const { mutate: updateApplication } = useUpdateApplicationQuery();

  const handleStatusChange = (): void => {
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        status: APPLICATION_STATUSES.HANDLING,
      },
      { deep: true }
    );
    updateApplication(currentApplicationData);
  };

  return (
    <$Grid>
      <$GridCell $colSpan={2}>
        <Button onClick={handleStatusChange} theme="coat">
          {t(`${translationsBase}.handle`)}
        </Button>
      </$GridCell>
      <$GridCell>
        <Button onClick={onSaveAndClose} theme="black" variant="secondary">
          {t(`${translationsBase}.close`)}
        </Button>
      </$GridCell>
    </$Grid>
  );
};

export default ReceivedApplicationActions;
