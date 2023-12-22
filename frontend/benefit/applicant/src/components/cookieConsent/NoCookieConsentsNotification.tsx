import { ROUTES } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { Button, Notification } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';

const NoCookieConsentsNotification: React.FC<{
  submittedApplication: string;
}> = ({ submittedApplication }) => {
  const { t } = useTranslation();
  const tBase = 'common:cookieNotification';
  const router = useRouter();
  const handleEditClick = (): void => {
    void router.push({
      pathname: ROUTES.COOKIE_SETTINGS,
      query: { submittedApplication },
    });
  };
  return (
    <Notification label={t(`${tBase}.title`)}>
      <p>{t(`${tBase}.text`)}</p>
      <Button onClick={handleEditClick}>{t(`${tBase}.button`)}</Button>
    </Notification>
  );
};

export default NoCookieConsentsNotification;
