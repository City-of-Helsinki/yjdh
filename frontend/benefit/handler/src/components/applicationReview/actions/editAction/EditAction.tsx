import useRequireAdditionalInformation from 'benefit/handler/hooks/useRequireAdditionalInformation';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Button, IconLock, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

export type Props = {
  application: Application;
};

const EditAction: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();

  const {
    mutate: requireAdditionalInformation,
    isLoading: isUpdatingApplication,
  } = useRequireAdditionalInformation();

  const updateApplicationStatus = (
    status: APPLICATION_STATUSES.INFO_REQUIRED | APPLICATION_STATUSES.HANDLING
  ): void => {
    requireAdditionalInformation({
      id: application.id,
      status,
    });
  };

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
          loadingText={t(`${translationsBase}.handlingToInfoRequired`)}
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
          loadingText={t(`${translationsBase}.infoRequiredToHandling`)}
          isLoading={isUpdatingApplication}
        >
          {t(`${translationsBase}.infoRequiredToHandling`)}
        </Button>
      )}
    </>
  );
};

export default EditAction;
