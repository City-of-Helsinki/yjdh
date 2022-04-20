import { FinnishSSN } from 'finnish-ssn';
import Field from 'kesaseteli/handler/components/form/Field';
import VtjErrorMessage from 'kesaseteli/handler/components/form/VtjErrorMessage';
import VtjErrorNotification from 'kesaseteli/handler/components/form/VtjErrorNotification';
import VtjRawDataAccordion from 'kesaseteli/handler/components/form/VtjRawData';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import VtjAddress from 'kesaseteli-shared/types/vtj-address';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Notification } from 'shared/components/notification/Notification.sc';
import { isWithinInterval } from 'shared/utils/date.utils';

type Props = {
  application: ActivatedYouthApplication;
};

const addressIsValid = (address: VtjAddress): boolean =>
  isWithinInterval(new Date(), {
    startDate: address.AsuminenAlkupvm,
    endDate: address.AsuminenLoppupvm,
  });

const VtjInfo: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const { vtj_data } = application;

  const notFound =
    vtj_data?.Henkilo?.Henkilotunnus?.['@voimassaolokoodi'] !== '1';
  const providedAt = vtj_data.Asiakasinfo.InfoS;
  const fullName = `${vtj_data.Henkilo.NykyisetEtunimet.Etunimet} ${vtj_data.Henkilo.NykyinenSukunimi.Sukunimi}`;
  const differentLastName =
    vtj_data.Henkilo.NykyinenSukunimi.Sukunimi.toLowerCase() !==
    application.last_name.toLowerCase();

  const socialSecurityNumber = vtj_data.Henkilo.Henkilotunnus['#text'] ?? '-';

  const permanentAddress = addressIsValid(
    vtj_data.Henkilo.VakinainenKotimainenLahiosoite
  )
    ? vtj_data.Henkilo.VakinainenKotimainenLahiosoite
    : undefined;
  const temporaryAddress = addressIsValid(
    vtj_data.Henkilo.TilapainenKotimainenLahiosoite
  )
    ? vtj_data.Henkilo.TilapainenKotimainenLahiosoite
    : undefined;
  const addressNotFound = !permanentAddress && !temporaryAddress;

  const { LahiosoiteS, Postinumero, PostitoimipaikkaS } =
    permanentAddress ?? temporaryAddress ?? {};
  const fullAddress = !addressNotFound
    ? `${LahiosoiteS} ${Postinumero} ${PostitoimipaikkaS}`
    : '-';
  const outsideHelsinki = PostitoimipaikkaS?.toLowerCase() !== 'helsinki';
  const differentPostCode = Postinumero !== application.postcode;

  const { ageInYears: age } = FinnishSSN.parse(
    vtj_data.Henkilo.Henkilotunnus['#text']
  );
  const notInTargetAgeGroup = ![15, 16].includes(age);

  const isDead = vtj_data.Henkilo.Kuolintiedot.Kuollut === '1';

  return (
    <span data-testid="vtj-info">
      {!notFound && (
        <$Notification
          label={t(`common:handlerApplication.vtjInfo.title`)}
          type={notFound ? 'alert' : 'info'}
        >
          <FormSection columns={1} withoutDivider>
            <Field id="vtjInfo.providedAt" value={providedAt} />
            <Field type="vtjInfo.name" value={fullName}>
              {differentLastName && (
                <VtjErrorMessage reason="differentLastName" />
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
                <VtjErrorMessage reason="differentPostCode" />
              )}
              {!addressNotFound && outsideHelsinki && (
                <VtjErrorMessage reason="outsideHelsinki" />
              )}
            </Field>
            <VtjRawDataAccordion data={vtj_data} />
          </FormSection>
        </$Notification>
      )}
      {notFound && <VtjErrorNotification reason="notFound" type="error" />}
      {isDead && <VtjErrorNotification reason="isDead" type="error" />}
    </span>
  );
};

export default VtjInfo;
