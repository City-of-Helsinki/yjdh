import { NotificationType } from 'hds-react';
import ActionButtons from 'kesaseteli/handler/components/form/ActionButtons';
import Field from 'kesaseteli/handler/components/form/Field';
import VtjInfo from 'kesaseteli/handler/components/form/VtjInfo';
import {
  YOUTH_APPLICATION_STATUS_COMPLETED,
  YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION,
  YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION,
} from 'kesaseteli-shared/constants/youth-application-status';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { $Notification } from 'shared/components/notification/Notification.sc';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

type Props = {
  application: ActivatedYouthApplication;
};

type MessageType = NotificationType | undefined;

const HandlerForm: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    receipt_confirmed_at,
    first_name,
    last_name,
    social_security_number,
    postcode,
    school,
    is_unlisted_school,
    phone_number,
    email,
    additional_info_provided_at,
    additional_info_user_reasons,
    additional_info_description,
    status,
  } = application;

  const waitingForUserAction = (
    YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION as ReadonlyArray<string>
  ).includes(status);

  const waitingForHandlerAction = (
    YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION as ReadonlyArray<string>
  ).includes(status);

  const isCompleted = (
    YOUTH_APPLICATION_STATUS_COMPLETED as ReadonlyArray<string>
  ).includes(status);

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

  const additionalInfoReasons = React.useMemo(
    () =>
      (additional_info_user_reasons ?? []).map((reason) =>
        t(`common:reasons.${reason}`)
      ),
    [additional_info_user_reasons, t]
  );

  const additionalInfoProvided = React.useMemo(
    () => status === 'additional_information_provided',
    [status]
  );

  return (
    <>
      <Field
        id="receipt_confirmed_at"
        value={convertToUIDateAndTimeFormat(receipt_confirmed_at)}
      />
      <$GridCell $colSpan={1} $rowSpan={additionalInfoProvided ? 12 : 8}>
        <VtjInfo application={application} />
      </$GridCell>
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
          padding-bottom: ${theme.spacing.s};
        `}
      />
      {additionalInfoProvided && (
        <>
          <FormSectionHeading
            size="s"
            header={t('common:handlerApplication.additionalInfoTitle')}
            as="h3"
          />
          <Field
            id="additional_info_provided_at"
            value={convertToUIDateAndTimeFormat(additional_info_provided_at)}
          />
          <Field
            type="additional_info_user_reasons"
            value={(additionalInfoReasons ?? []).join('. ')}
          />
          <Field
            type="additional_info_description"
            value={additional_info_description}
            css={`
              padding-bottom: ${theme.spacing.m};
            `}
          />
        </>
      )}
      {waitingForHandlerAction ? (
        <ActionButtons
          application={application}
          $rowSpan={additionalInfoProvided ? 12 : 8}
        />
      ) : (
        <$GridCell>
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
