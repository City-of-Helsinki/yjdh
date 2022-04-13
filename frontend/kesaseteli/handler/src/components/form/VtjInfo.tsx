import { useTranslation } from 'next-i18next';
import React from 'react';
import { $Notification } from 'shared/components/notification/Notification.sc';

const VtjInfo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <$Notification
      data-testid="vtj-info"
      label={t(`common:vtj.title`)}
      type="info"
    >
      <pre>
        {JSON.stringify(
          {
            name: 'Anneli kulmala',
            hetu: '010105-T123',
            address: '12345 Vantaa',
          },
          null,
          2
        )}
      </pre>
    </$Notification>
  );
};

export default VtjInfo;
