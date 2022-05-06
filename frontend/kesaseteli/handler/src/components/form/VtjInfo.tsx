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
  const { encrypted_vtj_json, social_security_number, last_name, postcode } =
    application;

  // TODO: Remove example data when backend part is implemented

  // const encrypted_vtj_json: VtjData = JSON.parse(`{
  //   "@xmlns": "http://xml.vrk.fi/schema/vtjkysely",
  //   "@xmlns:vtj": "http://xml.vrk.fi/schema/vtj/henkilotiedot/1",
  //   "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
  //   "@sanomatunnus": "PERUSSANOMA 1",
  //   "@tietojenPoimintaaika": "20220407090956",
  //   "@versio": "1.0",
  //   "@xsi:schemaLocation": "http://xml.vrk.fi/schema/vtjkysely PERUSSANOMA 1.xsd",
  //   "Asiakasinfo": {
  //     "InfoS": "07.04.2022 09:09",
  //     "InfoR": "07.04.2022 09:09",
  //     "InfoE": "07.04.2022 09:09"
  //   },
  //   "Paluukoodi": {
  //     "@koodi": "0000",
  //     "#text": "Haku onnistui"
  //   },
  //   "Hakuperusteet": {
  //     "Henkilotunnus": {
  //       "@hakuperustePaluukoodi": "1",
  //       "@hakuperusteTekstiE": "Found",
  //       "@hakuperusteTekstiR": "Hittades",
  //       "@hakuperusteTekstiS": "Löytyi",
  //       "#text": "010170-999R"
  //     }
  //   },
  //   "Henkilo": {
  //     "Henkilotunnus": {
  //       "@voimassaolokoodi": "1",
  //       "#text": "010170-999R"
  //     },
  //     "NykyinenSukunimi": {
  //       "Sukunimi": "Äyrämö"
  //     },
  //     "NykyisetEtunimet": {
  //       "Etunimet": "Tero Testi"
  //     },
  //     "VakinainenKotimainenLahiosoite": {
  //       "LahiosoiteS": "Kauppa Puistikko 6 B 15",
  //       "LahiosoiteR": "Handels Esplanaden 6 B 15",
  //       "Postinumero": "65100",
  //       "PostitoimipaikkaS": "VAASA",
  //       "PostitoimipaikkaR": "VASA",
  //       "AsuminenAlkupvm": "20260515",
  //       "AsuminenLoppupvm": null
  //     },
  //     "VakinainenAsuinpaikka": {
  //       "Asuinpaikantunnus": "90000009871B015 "
  //     },
  //     "VakinainenUlkomainenLahiosoite": {
  //       "UlkomainenLahiosoite": null,
  //       "UlkomainenPaikkakuntaJaValtioS": null,
  //       "UlkomainenPaikkakuntaJaValtioR": null,
  //       "UlkomainenPaikkakuntaJaValtioSelvakielinen": null,
  //       "Valtiokoodi3": null,
  //       "AsuminenAlkupvm": null,
  //       "AsuminenLoppupvm": null
  //     },
  //     "TilapainenKotimainenLahiosoite": {
  //       "LahiosoiteS": "Sepänkatu 11 A 2",
  //       "LahiosoiteR": null,
  //       "Postinumero": "70100",
  //       "PostitoimipaikkaS": "KUOPIO",
  //       "PostitoimipaikkaR": "KUOPIO",
  //       "AsuminenAlkupvm": "20181118",
  //       "AsuminenLoppupvm": "20200601"
  //     },
  //     "TilapainenUlkomainenLahiosoite": {
  //       "UlkomainenLahiosoite": null,
  //       "UlkomainenPaikkakuntaJaValtioS": null,
  //       "UlkomainenPaikkakuntaJaValtioR": null,
  //       "UlkomainenPaikkakuntaJaValtioSelvakielinen": null,
  //       "Valtiokoodi3": null,
  //       "AsuminenAlkupvm": null,
  //       "AsuminenLoppupvm": null
  //     },
  //     "KotimainenPostiosoite": {
  //       "PostiosoiteS": "PL 808",
  //       "PostiosoiteR": "PB 808",
  //       "Postinumero": "70101",
  //       "PostitoimipaikkaS": "KUOPIO",
  //       "PostitoimipaikkaR": "KUOPIO",
  //       "PostiosoiteAlkupvm": "20181201",
  //       "PostiosoiteLoppupvm": null
  //     },
  //     "UlkomainenPostiosoite": {
  //       "UlkomainenLahiosoite": null,
  //       "UlkomainenPaikkakunta": null,
  //       "Valtiokoodi3": null,
  //       "ValtioS": null,
  //       "ValtioR": null,
  //       "ValtioSelvakielinen": null,
  //       "PostiosoiteAlkupvm": null,
  //       "PostiosoiteLoppupvm": null
  //     },
  //     "Kotikunta": {
  //       "Kuntanumero": "905",
  //       "KuntaS": "Vaasa",
  //       "KuntaR": "Vasa",
  //       "KuntasuhdeAlkupvm": "20060515"
  //     },
  //     "Kuolintiedot": {
  //       "Kuollut": "1",
  //       "Kuolinpvm": null
  //     },
  //     "Kuolleeksijulistamistiedot": {
  //       "Kuolleeksijulistamispvm": null
  //     },
  //     "Aidinkieli": {
  //       "Kielikoodi": "da",
  //       "KieliS": "tanska",
  //       "KieliR": "danska",
  //       "KieliSelvakielinen": null
  //     },
  //     "Sukupuoli": {
  //       "Sukupuolikoodi": "1",
  //       "SukupuoliS": "Mies",
  //       "SukupuoliR": "Man"
  //     }
  //   }
  // }`);

  if (!encrypted_vtj_json) {
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
            <VtjRawDataAccordion data={encrypted_vtj_json} />
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
