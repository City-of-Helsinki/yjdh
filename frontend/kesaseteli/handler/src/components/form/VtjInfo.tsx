import Field from 'kesaseteli/handler/components/form/Field';
import VtjErrorMessage from 'kesaseteli/handler/components/form/VtjErrorMessage';
import VtjErrorNotification from 'kesaseteli/handler/components/form/VtjErrorNotification';
import VtjRawDataAccordion from 'kesaseteli/handler/components/form/VtjRawData';
import { mapVtjData } from 'kesaseteli/handler/utils/map-vtj-data';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Notification } from 'shared/components/notification/Notification.sc';

type Props = {
  application: ActivatedYouthApplication;
};

const VtjInfo: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const {
    encrypted_handler_vtj_json: vtjData,
    social_security_number,
    last_name,
    postcode,
  } = application;

  if (!vtjData || !('Henkilo' in vtjData)) {
    return (
      <VtjErrorNotification
        reason="notFound"
        type="error"
        params={{ social_security_number }}
      />
    );
  }

  const {
    notFound,
    providedAt,
    fullName,
    differentLastName,
    socialSecurityNumber,
    addressNotFound,
    fullAddress,
    outsideHelsinki,
    differentPostCode,
    age,
    notInTargetAgeGroup,
    isDead,
  } = mapVtjData(application);

  return (
    <span data-testid="vtj-info">
      {!notFound && (
        <$Notification
          label={t(`common:handlerApplication.vtjInfo.title`)}
          type="info"
        >
          <FormSection columns={1} withoutDivider>
            <Field id="vtjInfo.providedAt" value={providedAt} />
            <Field type="vtjInfo.name" value={fullName}>
              {differentLastName && (
                <VtjErrorMessage
                  reason="differentLastName"
                  params={{ last_name }}
                />
              )}
            </Field>
            <Field type="vtjInfo.ssn" value={socialSecurityNumber}>
              {notInTargetAgeGroup && (
                <VtjErrorMessage
                  reason="notInTargetAgeGroup"
                  params={{ age }}
                />
              )}
            </Field>
            <Field type="vtjInfo.address" value={fullAddress}>
              {addressNotFound && <VtjErrorMessage reason="addressNotFound" />}
              {!addressNotFound && differentPostCode && (
                <VtjErrorMessage
                  reason="differentPostCode"
                  params={{ postcode }}
                />
              )}
              {!addressNotFound && outsideHelsinki && (
                <VtjErrorMessage reason="outsideHelsinki" />
              )}
            </Field>
            <VtjRawDataAccordion data={vtjData} />
          </FormSection>
        </$Notification>
      )}
      {notFound && (
        <VtjErrorNotification
          reason="notFound"
          type="error"
          params={{ social_security_number }}
        />
      )}
      {isDead && <VtjErrorNotification reason="isDead" type="error" />}
    </span>
  );
};

export default VtjInfo;
