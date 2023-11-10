import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $StatusLabel } from './StatusLabel.sc';

const StatusLabel: React.FC<{ status: APPLICATION_STATUSES }> = ({
  status,
}) => {
  const { t } = useTranslation();
  return (
    <$StatusLabel status={status}>{t(`common:status.${status}`)}</$StatusLabel>
  );
};

export default StatusLabel;
