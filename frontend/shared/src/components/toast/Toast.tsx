import { Notification, NotificationProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { ReactText, useEffect } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { HDSToastContainerId } from './ToastContainer';

interface HDSToastArgs {
  autoDismissTime?: number;
  type: NotificationProps['type'];
  labelText: string;
  text: string | JSX.Element | Array<string | JSX.Element>;
  toastId?: string;
}

interface NotificationWrapperProps extends HDSToastArgs {
  toastId: string;
}

const AUTO_DISMISS_TIME = 3000 as const;

const NotificationWrapper = ({
  autoDismissTime = AUTO_DISMISS_TIME,
  type,
  labelText,
  text,
  toastId,
}: NotificationWrapperProps): JSX.Element => {
  const { t } = useTranslation();

  useEffect(() => {
    if (autoDismissTime) {
      const timer = setTimeout(() => {
        toast.dismiss(toastId);
      }, autoDismissTime);
      return (): void => clearTimeout(timer);
    }
    return () => {};
  }, [autoDismissTime, toastId]);
  let body: React.ReactNode = text;

  if (Array.isArray(text)) {
    body = (
      <ul>
        {text.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <Notification
      type={type}
      dismissible
      closeButtonLabelText={t('common:toast.closeToast') ?? ''}
      label={labelText}
      onClose={() => toast.dismiss(toastId)}
    >
      {body}
    </Notification>
  );
};

const hdsToast = ({
  autoDismissTime = AUTO_DISMISS_TIME,
  type,
  labelText,
  text,
  toastId,
}: HDSToastArgs): ReactText => {
  const id = toastId ?? uuidv4();
  return toast(
    <NotificationWrapper
      type={type}
      labelText={labelText}
      text={text}
      toastId={id}
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
  autoDismissTime: AUTO_DISMISS_TIME,
  toastId: '',
};

NotificationWrapper.defaultProps = defaultProps;

export default hdsToast;
