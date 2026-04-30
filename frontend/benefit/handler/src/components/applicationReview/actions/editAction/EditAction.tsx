import useRequireAdditionalInformation from 'benefit/handler/hooks/useRequireAdditionalInformation';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import {
  ButtonPresetTheme,
  ButtonSize,
  ButtonVariant,
  IconLock,
  IconPen,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Button from 'shared/components/button/Button';

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
      id: application.id || '',
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
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          iconStart={<IconPen />}
          loadingText={t(`${translationsBase}.handlingToInfoRequired`)}
          isLoading={isUpdatingApplication}
        >
          {t(`${translationsBase}.handlingToInfoRequired`)}
        </Button>
      )}
      {application.status === APPLICATION_STATUSES.INFO_REQUIRED && (
        <Button
          onClick={() => updateApplicationStatus(APPLICATION_STATUSES.HANDLING)}
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          iconStart={<IconLock />}
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
