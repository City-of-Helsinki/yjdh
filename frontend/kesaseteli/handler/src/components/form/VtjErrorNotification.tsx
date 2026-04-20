import { NotificationProps } from 'hds-react';
import VtjExceptionType from 'kesaseteli/handler/types/vtj-exception-type';
import { useTranslation } from 'next-i18next';
import React from 'react';

import $VtjException from './VtjErrorNotification.sc';

type Props = {
  reason: VtjExceptionType;
  type?: NotificationProps['type'];
  size?: NotificationProps['size'];
  params?: Record<string, string | number>;
};
const VtjErrorNotification: React.FC<Props> = ({
  reason,
  type = 'alert',
  size = 'small',
  params,
}) => {
  const { t } = useTranslation();
  return (
    <$VtjException
      data-testid={`vtj-exception-${reason}`}
      label=" "
      type={type}
      size={size}
    >
      {t(`common:handlerApplication.vtjException.${reason}`, params)}
    </$VtjException>
  );
};

export default VtjErrorNotification;
