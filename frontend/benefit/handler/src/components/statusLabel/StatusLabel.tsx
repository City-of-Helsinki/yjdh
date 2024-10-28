import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $StatusLabel } from './StatusLabel.sc';

const StatusLabel: React.FC<{
  status: APPLICATION_STATUSES;
  archived?: boolean;
}> = ({ status, archived }) => {
  const { t } = useTranslation();
  return (
    <$StatusLabel status={status}>
      {t(`common:status.${status}`)}
      {archived &&
        ` / ${t('common:header.navigation.archive').toLocaleLowerCase()}`}
    </$StatusLabel>
  );
};

export default StatusLabel;
