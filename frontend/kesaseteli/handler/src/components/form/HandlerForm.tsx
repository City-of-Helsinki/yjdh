import { NotificationType } from 'hds-react';
import ActionButtons from 'kesaseteli/handler/components/form/ActionButtons';
import Field from 'kesaseteli/handler/components/form/Field';
import {
  YOUTH_APPLICATION_STATUS_COMPLETED,
  YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION,
  YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION,
} from 'kesaseteli-shared/constants/status-constants';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { $Notification } from 'shared/components/notification/Notification.sc';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

type Props = {
  application: CreatedYouthApplication;
};

type MessageType = NotificationType | undefined;

const HandlerForm: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    id,
    receipt_confirmed_at,
    first_name,
    last_name,
    social_security_number,
    postcode,
    school,
    is_unlisted_school,
    phone_number,
    email,
    status,
  } = application;

  const waitingForUserAction = React.useMemo(
    () =>
      (
        YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION as ReadonlyArray<string>
      ).includes(status),
    [status]
  );
  const waitingForHandlerAction = React.useMemo(
    () =>
      (
        YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION as ReadonlyArray<string>
      ).includes(status),
    [status]
  );
  const isCompleted = React.useMemo(
    () =>
      (YOUTH_APPLICATION_STATUS_COMPLETED as ReadonlyArray<string>).includes(
        status
      ),
    [status]
  );

  // eslint-disable-next-line consistent-return
  const notificationType: MessageType = React.useMemo(() => {
    if (!status || waitingForUserAction) {
      return 'error';
    }
    if (status === 'accepted') {
      return 'success';
    }
    if (status === 'rejected') {
      return 'alert';
    }
  }, [status, waitingForUserAction]);

  const statusId = React.useMemo(() => String(status || 'submitted'), [status]);

  return (
    <>
      <Field
        id="receipt_confirmed_at"
        value={convertToUIDateAndTimeFormat(receipt_confirmed_at)}
      />
      <Field type="name" value={`${first_name} ${last_name}`} />
      <Field type="social_security_number" value={social_security_number} />
      <Field type="postcode" value={postcode} />
      <Field
        type="school"
        value={`${school ?? ''} ${
          is_unlisted_school
            ? t('common:handlerApplication.is_unlisted_school')
            : ''
        }`}
      />
      <Field type="phone_number" value={phone_number} />
      <Field
        type="email"
        value={email}
        css={`
          padding-bottom: ${theme.spacing.m};
        `}
      />
      {waitingForHandlerAction ? (
        <ActionButtons id={id} />
      ) : (
        <$GridCell $colSpan={2}>
          <$Notification
            data-testid={`status-notification-${statusId}`}
            label={t(`common:handlerApplication.notification.${statusId}`)}
            type={notificationType}
          >
            {isCompleted && email && <a href={`mailto:${email}`}>{email}</a>}
          </$Notification>
        </$GridCell>
      )}
    </>
  );
};

export default HandlerForm;
