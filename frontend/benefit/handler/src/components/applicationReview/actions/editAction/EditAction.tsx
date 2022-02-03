import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import { useApplicationActions } from 'benefit/handler/hooks/useApplicationActions';
import { Application } from 'benefit/handler/types/application';
import { Button, IconLock, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

export type Props = {
  application: Application;
};

const EditAction: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const { updateStatus } = useApplicationActions(application);

  const [isUpdatingApplication, setIsUpdatingApplication] =
    React.useState(false);

  const updateApplicationStatus = (status: APPLICATION_STATUSES) => {
    setIsUpdatingApplication(true);
    updateStatus(status);
  };

  React.useEffect(() => {
    setIsUpdatingApplication(false);
  }, [application.status]);

  return (
    <>
      {application.status === APPLICATION_STATUSES.HANDLING && (
        <Button
          onClick={() =>
            updateApplicationStatus(APPLICATION_STATUSES.INFO_REQUIRED)
          }
          theme="black"
          variant="secondary"
          size="small"
          iconLeft={<IconPen />}
          isLoading={isUpdatingApplication}
        >
          {t(`${translationsBase}.handlingToInfoRequired`)}
        </Button>
      )}
      {application.status === APPLICATION_STATUSES.INFO_REQUIRED && (
        <Button
          onClick={() => updateApplicationStatus(APPLICATION_STATUSES.HANDLING)}
          theme="black"
          variant="secondary"
          size="small"
          iconLeft={<IconLock />}
          isLoading={isUpdatingApplication}
        >
          {t(`${translationsBase}.infoRequiredToHandling`)}
        </Button>
      )}
    </>
  );
};

export default EditAction;
