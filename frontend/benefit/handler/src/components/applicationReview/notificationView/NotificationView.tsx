import { ROUTES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import $Notification from 'shared/components/notification/Notification.sc';
import { useTheme } from 'styled-components';

const NotificationView: React.FC = () => {
  const translationsBase = 'common:notifications';
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  const handleGoHome = (): void => {
    void router.push(ROUTES.HOME);
  };

  const handleCheck = (): void => setHandledApplication(null);

  return (
    <>
      <$Grid
        css={`
          margin-top: ${theme.spacing.m};
        `}
      >
        <$GridCell $colSpan={12}>
          <$Notification
            label={t(
              `${translationsBase}.${
                handledApplication?.status ?? 'error'
              }.title`
            )}
            type="info"
          >
            {t(
              `${translationsBase}.${
                handledApplication?.status ?? 'error'
              }.message`
            )}
          </$Notification>
        </$GridCell>
      </$Grid>
      <$Grid>
        <$GridCell $colSpan={2}>
          <Button theme="coat" variant="secondary" onClick={handleGoHome}>
            {t('common:utility.home')}
          </Button>
        </$GridCell>
        {handledApplication?.status && (
          <$GridCell $colSpan={3}>
            <Button theme="coat" onClick={handleCheck}>
              {t('common:utility.check')}
            </Button>
          </$GridCell>
        )}
      </$Grid>
    </>
  );
};

export default NotificationView;
