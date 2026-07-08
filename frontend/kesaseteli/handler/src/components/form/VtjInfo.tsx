import Field, {
  $DescriptionList,
} from 'kesaseteli/handler/components/form/Field';
import VtjErrorMessage from 'kesaseteli/handler/components/form/VtjErrorMessage';
import VtjRawDataAccordion from 'kesaseteli/handler/components/form/VtjRawData';
import {
  getVtjException,
  mapVtjData,
} from 'kesaseteli/handler/utils/map-vtj-data';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { $Notification } from 'shared/components/notification/Notification.sc';
import styled from 'styled-components';

type Props = {
  application: ActivatedYouthApplication;
};

const $RestrictedNotification = styled($Notification)`
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

const $VtjCard = styled.div`
  background-color: var(--color-fog-light);
  border: 1px solid ${(props) => props.theme.colors.black10};
  padding: ${(props) => props.theme.spacing.m};
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${(props) => props.theme.spacing.m};
  align-content: start;
`;

const VtjInfo: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const {
    encrypted_handler_vtj_json: vtjData,
    last_name,
    postcode,
    is_vtj_data_restricted,
  } = application;

  const vtjException = getVtjException(application);
  if (vtjException) {
    return null;
  }

  const {
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
  } = mapVtjData(application);

  return (
    <span data-testid="vtj-info">
      {is_vtj_data_restricted && (
        <$RestrictedNotification
          label={t('common:handlerApplication.vtjInfo.dataRestricted')}
          type="info"
        />
      )}
      <$VtjCard>
        <FormSectionHeading
          id="vtj-info-heading"
          header={t('common:handlerApplication.vtjInfo.title')}
          as="h4"
        />
        <$DescriptionList aria-labelledby="vtj-info-heading">
          <Field
            id="vtjInfo.providedAt"
            type="vtjInfo.providedAt"
            value={providedAt}
          />
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
              <VtjErrorMessage reason="notInTargetAgeGroup" params={{ age }} />
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
        </$DescriptionList>
        <VtjRawDataAccordion data={vtjData} />
      </$VtjCard>
    </span>
  );
};

export default VtjInfo;
