import { APPLICATION_STATUSES, ROUTES } from 'benefit/handler/constants';
import useUpdateApplicationQuery from 'benefit/handler/hooks/useUpdateApplicationQuery';
import { Application,ApplicationData  } from 'benefit/handler/types/application';
import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import snakecaseKeys from 'snakecase-keys';

type Props = {
  application: Application;
};

const ReceivedApplicationActions: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const router = useRouter();

  const { mutate: updateApplication } = useUpdateApplicationQuery();

  const handleCloseClick = (): void => {
    void router.push(ROUTES.HOME);
  };

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
        <Button onClick={handleCloseClick} theme="black" variant="secondary">
          {t(`${translationsBase}.close`)}
        </Button>
      </$GridCell>
    </$Grid>
  );
};

export default ReceivedApplicationActions;
