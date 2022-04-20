import React from 'react';
import $VtjException from './VtjErrorNotification.sc';
import VtjExceptionType from 'kesaseteli/handler/types/vtj-exception-type';
import { useTranslation } from 'next-i18next';
import { NotificationProps } from 'hds-react';

type Props = {
  reason: VtjExceptionType;
  type?: NotificationProps['type'];
  params?: Record<string, string | number>;
};
const VtjErrorNotification: React.FC<Props> = ({ reason, type, params }) => {
  const { t } = useTranslation();
  return (
    <$VtjException
      data-testid={`vtj-exception-${reason}`}
      label=" "
      type={type ?? 'alert'}
      size="small"
    >
      {t(`common:handlerApplication.vtjException.${reason}`, params)}
    </$VtjException>
  );
};

VtjErrorNotification.defaultProps = {
  params: undefined,
  type: 'alert',
};

export default VtjErrorNotification;
