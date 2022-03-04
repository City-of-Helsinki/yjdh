import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';

const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="alert"
      title={t(`common:403Page.forbiddenPageLabel`)}
      message={
        <Trans
          i18nKey="common:403Page.forbiddenPageContent"
          components={{
            a: (
              <a
                href="https://helsinki.service-now.com/sp/"
                rel="noopener noreferrer"
                target="_blank"
              >
                {}
              </a>
            ),
          }}
        />
      }
    />
  );
};

ForbiddenPage.defaultProps = {
  helpdeskEmail: undefined,
};

export default ForbiddenPage;
