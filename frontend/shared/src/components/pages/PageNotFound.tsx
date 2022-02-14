import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import LinkText from 'shared/components/link-text/LinkText';
import NotificationPage from 'shared/components/pages/NotificationPage';

const PageNotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="alert"
      title={t(`common:404Page.pageNotFoundLabel`)}
      message={
        <Trans
          i18nKey="common:404Page.pageNotFoundContent"
          components={{
            lnk: <LinkText href="/">{}</LinkText>,
          }}
        />
      }
    />
  );
};

export default PageNotFound;
