import { NotificationType } from 'hds-react';
import ActionButtons from 'kesaseteli/handler/components/form/ActionButtons';
import Field from 'kesaseteli/handler/components/form/Field';
import LinkedEmployerApplications from 'kesaseteli/handler/components/form/LinkedEmployerApplications';
import VtjInfo from 'kesaseteli/handler/components/form/VtjInfo';
import isHandlerNewBetaUiEnabled from 'kesaseteli/handler/flags/is-handler-new-beta-ui-enabled';
import {
  YOUTH_APPLICATION_STATUS_COMPLETED,
  YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION,
  YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION,
} from 'kesaseteli-shared/constants/youth-application-status';
import isVtjDisabled from 'kesaseteli-shared/flags/is-vtj-disabled';
import useSummerVoucherConfigurationQuery from 'kesaseteli-shared/hooks/useSummerVoucherConfigurationQuery';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import type YouthApplicationStatusType from 'kesaseteli-shared/types/youth-application-status-type';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { $Notification } from 'shared/components/notification/Notification.sc';
import {
  convertToUIDateAndTimeFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';
import styled from 'styled-components';

type Props = {
  application: ActivatedYouthApplication;
};

const includesStatus = (
  arr: ReadonlyArray<YouthApplicationStatusType>,
  val: YouthApplicationStatusType
): boolean => arr.includes(val);

const getNotificationType = (
  status: YouthApplicationStatusType,
  waitingForUserAction: boolean
): NotificationType | undefined => {
  if (waitingForUserAction) return 'error';
  if (status === 'accepted') return 'success';
  if (status === 'rejected') return 'alert';
  return undefined;
};

type TargetGroupParams = {
  receiptConfirmedAt?: string;
  createdAt?: string;
  targetGroup?: string;
  configurations?: Array<{
    year: number;
    target_groups?: Array<{ id: string; name: string }>;
  }>;
};

const getTargetGroupName = ({
  receiptConfirmedAt,
  createdAt,
  targetGroup,
  configurations,
}: TargetGroupParams): string => {
  if (!targetGroup) return '';
  const appYear = new Date(
    receiptConfirmedAt || createdAt || new Date()
  ).getFullYear();
  const config = configurations?.find((c) => c.year === appYear);
  return (
    config?.target_groups?.find((tg) => tg.id === targetGroup)?.name ??
    targetGroup
  );
};

const $PanelGrid = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  > * {
    flex: 1 1 400px;
    min-width: 0;
  }
`;

const $StatusNotification = styled($Notification)`
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

const $Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.m};
`;

const AdditionalInfoSection: React.FC<{
  t: (key: string) => string;
  providedAt?: string;
  reasons: string;
  description?: string;
}> = ({ t, providedAt, reasons, description }) => (
  <>
    <FormSectionHeading
      size="s"
      as="h3"
      header={t('common:handlerApplication.additionalInfoTitle')}
    />
    <Field
      id="additional_info_provided_at"
      value={convertToUIDateAndTimeFormat(providedAt)}
    />
    <Field type="additional_info_user_reasons" value={reasons} />
    <Field
      type="additional_info_description"
      value={description}
      css={{ marginBottom: '1rem' }}
    />
  </>
);

type FormLayoutProps = {
  application: ActivatedYouthApplication;
  t: (key: string) => string;
  waitingForHandlerAction: boolean;
  isCompleted: boolean;
  additionalInfoProvided: boolean;
  notificationType: NotificationType | undefined;
  targetGroupName: string;
  schoolValue: string;
  additionalInfoReasons: string;
  showVtj: boolean;
  showEmployerApps: boolean;
};

const FormLayout: React.FC<FormLayoutProps> = ({
  application,
  t,
  waitingForHandlerAction,
  isCompleted,
  additionalInfoProvided,
  notificationType,
  targetGroupName,
  schoolValue,
  additionalInfoReasons,
  showVtj,
  showEmployerApps,
}) => {
  const {
    receipt_confirmed_at,
    first_name,
    last_name,
    social_security_number,
    non_vtj_birthdate,
    non_vtj_home_municipality,
    postcode,
    phone_number,
    email,
    status,
    additional_info_provided_at,
    additional_info_description,
    employer_applications,
  } = application;

  return (
    <$GridCell $colSpan={2}>
      {!waitingForHandlerAction && (
        <$StatusNotification
          data-testid={`status-notification-${status}`}
          label={t(`common:handlerApplication.notification.${status}`)}
          type={notificationType}
        >
          {isCompleted && email && <a href={`mailto:${email}`}>{email}</a>}
        </$StatusNotification>
      )}

      <$PanelGrid>
        <$Column>
          <FormSection columns={1} withoutDivider>
            {receipt_confirmed_at && (
              <Field
                id="receipt_confirmed_at"
                value={convertToUIDateAndTimeFormat(receipt_confirmed_at)}
              />
            )}
            <Field type="name" value={`${first_name} ${last_name}`} />

            {social_security_number && (
              <Field
                type="social_security_number"
                value={social_security_number}
              />
            )}
            {non_vtj_birthdate && (
              <Field
                type="non_vtj_birthdate"
                value={convertToUIDateFormat(non_vtj_birthdate)}
              />
            )}
            {non_vtj_home_municipality && (
              <Field
                type="non_vtj_home_municipality"
                value={non_vtj_home_municipality}
              />
            )}

            <Field type="postcode" value={postcode} />
            <Field type="school" value={schoolValue} />
            <Field type="phone_number" value={phone_number} />
            <Field
              type="email"
              value={email}
              css={{ marginBottom: '0.5rem' }}
            />
            <Field
              type="target_group"
              value={targetGroupName}
              css={{ marginBottom: '0.5rem' }}
            />

            {additionalInfoProvided && (
              <AdditionalInfoSection
                t={t}
                providedAt={additional_info_provided_at}
                reasons={additionalInfoReasons}
                description={additional_info_description}
              />
            )}

            {waitingForHandlerAction && (
              <div style={{ marginTop: '1rem' }}>
                <ActionButtons application={application} />
              </div>
            )}
          </FormSection>
        </$Column>

        {(showVtj || showEmployerApps) && (
          <$Column>
            {showVtj && <VtjInfo application={application} />}
            {showEmployerApps && (
              <LinkedEmployerApplications
                employerApplications={employer_applications}
              />
            )}
          </$Column>
        )}
      </$PanelGrid>
    </$GridCell>
  );
};

const HandlerForm: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const { data: configurations } = useSummerVoucherConfigurationQuery();
  const {
    status,
    receipt_confirmed_at,
    created_at,
    target_group,
    school,
    is_unlisted_school,
    additional_info_user_reasons,
    employer_applications,
  } = application;

  const waitingForUserAction = includesStatus(
    YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION,
    status
  );
  const waitingForHandlerAction = includesStatus(
    YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION,
    status
  );
  const isCompleted = includesStatus(
    YOUTH_APPLICATION_STATUS_COMPLETED,
    status
  );
  const additionalInfoProvided = status === 'additional_information_provided';

  const notificationType = getNotificationType(status, waitingForUserAction);
  const showVtj = !isVtjDisabled();
  const showEmployerApps =
    isHandlerNewBetaUiEnabled() && (employer_applications?.length ?? 0) > 0;

  const targetGroupName = getTargetGroupName({
    receiptConfirmedAt: receipt_confirmed_at ?? '',
    createdAt: created_at,
    targetGroup: target_group,
    configurations,
  });

  const schoolValue = `${school ?? ''} ${
    is_unlisted_school ? t('common:handlerApplication.is_unlisted_school') : ''
  }`.trim();
  const additionalInfoReasons = (additional_info_user_reasons ?? [])
    .map((r) => t(`common:reasons.${r}`))
    .join('. ');

  return (
    <FormLayout
      application={application}
      t={t}
      waitingForHandlerAction={waitingForHandlerAction}
      isCompleted={isCompleted}
      additionalInfoProvided={additionalInfoProvided}
      notificationType={notificationType}
      targetGroupName={targetGroupName}
      schoolValue={schoolValue}
      additionalInfoReasons={additionalInfoReasons}
      showVtj={showVtj}
      showEmployerApps={showEmployerApps}
    />
  );
};

export default HandlerForm;
