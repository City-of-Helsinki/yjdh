import ActivationErrorPage from 'kesaseteli/youth/components/activation-error-page/ActivationErrorPage';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const AlreadyAssignedPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ActivationErrorPage
      title={t(`common:alreadyAssignedPage.title`)}
      message={t(`common:alreadyAssignedPage.notificationMessage`)}
      goToFrontPageText={t(`common:activationErrorPage.goToFrontendPage`)}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default AlreadyAssignedPage;
