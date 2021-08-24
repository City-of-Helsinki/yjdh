import { Notification, NotificationProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { ReactText, useEffect } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { HDSToastContainerId } from './ToastContainer';

interface HDSToastArgs {
  autoDismiss?: boolean;
  autoDismissTime?: number;
  type: NotificationProps['type'];
  labelText: string;
  text: string;
  toastId?: string;
  translated?: boolean;
}

interface NotificationWrapperProps extends HDSToastArgs {
  toastId: string;
  translated: boolean;
}

const AUTO_DISMISS_TIME = 3000 as const;

const NotificationWrapper = ({
  autoDismiss,
  autoDismissTime = AUTO_DISMISS_TIME,
  type,
  labelText,
  text,
  toastId,
  translated,
}: NotificationWrapperProps): JSX.Element => {
  const { t } = useTranslation();

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        toast.dismiss(toastId);
      }, autoDismissTime);
      return (): void => clearTimeout(timer);
    }
    return () => {};
  }, [autoDismiss, autoDismissTime, toastId]);

  return (
    <Notification
      type={type}
      dismissible
      closeButtonLabelText={t('common:toast.closeToast') ?? ''}
      label={translated ? t(labelText) : labelText}
      onClose={() => toast.dismiss(toastId)}
    >
      {translated ? t(text) : text}
    </Notification>
  );
};

const hdsToast = ({
  autoDismiss = true,
  autoDismissTime = AUTO_DISMISS_TIME,
  type,
  labelText,
  text,
  toastId,
  translated = false,
}: HDSToastArgs): ReactText => {
  const id = toastId ?? uuidv4();
  return toast(
    <NotificationWrapper
      autoDismiss={autoDismiss}
      type={type}
      labelText={labelText}
      text={text}
      toastId={id}
      translated={translated}
      autoDismissTime={autoDismissTime}
    />,
    {
      toastId: id,
      containerId: HDSToastContainerId,
      autoClose: false,
    }
  );
};

const defaultProps = {
  autoDismiss: false,
  autoDismissTime: 3000,
  toastId: '',
  translated: false,
};

NotificationWrapper.defaultProps = defaultProps;

export default hdsToast;
