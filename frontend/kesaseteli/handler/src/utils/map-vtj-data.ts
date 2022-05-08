import { FinnishSSN } from 'finnish-ssn';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import VtjAddress from 'kesaseteli-shared/types/vtj-address';
import { isWithinInterval } from 'shared/utils/date.utils';

type VtjInfo = {
  notFound: boolean;
  providedAt: string;
  fullName: string;
  differentLastName: boolean;
  socialSecurityNumber: string;
  addressNotFound: boolean;
  fullAddress: string;
  outsideHelsinki: boolean;
  differentPostCode: boolean;
  age: number;
  notInTargetAgeGroup: boolean;
  isDead: boolean;
};

const addressIsValid = (address: VtjAddress): boolean =>
  isWithinInterval(new Date(), {
    startDate: address.AsuminenAlkupvm,
    endDate: address.AsuminenLoppupvm,
  });

export const mapVtjData = (application: ActivatedYouthApplication): VtjInfo => {
  const { encrypted_vtj_json: vtjData, last_name, postcode } = application;
  const notFound =
    vtjData.Henkilo?.Henkilotunnus?.['@voimassaolokoodi'] !== '1';
  const providedAt = vtjData.Asiakasinfo?.InfoS ?? '';
  const fullName = `${vtjData.Henkilo.NykyisetEtunimet.Etunimet} ${vtjData.Henkilo.NykyinenSukunimi.Sukunimi}`;
  const differentLastName =
    vtjData.Henkilo.NykyinenSukunimi.Sukunimi.toLowerCase() !==
    last_name.toLowerCase();

  const socialSecurityNumber = vtjData.Henkilo.Henkilotunnus['#text'] ?? '-';

  const permanentAddress = addressIsValid(
    vtjData.Henkilo.VakinainenKotimainenLahiosoite
  )
    ? vtjData.Henkilo.VakinainenKotimainenLahiosoite
    : undefined;
  const temporaryAddress = addressIsValid(
    vtjData.Henkilo.TilapainenKotimainenLahiosoite
  )
    ? vtjData.Henkilo.TilapainenKotimainenLahiosoite
    : undefined;
  const addressNotFound = !permanentAddress && !temporaryAddress;

  const { LahiosoiteS, Postinumero, PostitoimipaikkaS } =
    permanentAddress ?? temporaryAddress ?? {};
  const fullAddress = !addressNotFound
    ? `${LahiosoiteS} ${Postinumero} ${PostitoimipaikkaS}`
    : '-';
  const outsideHelsinki = PostitoimipaikkaS?.toLowerCase() !== 'helsinki';
  const differentPostCode = Postinumero !== postcode;

  const { dateOfBirth } = FinnishSSN.parse(
    vtjData.Henkilo.Henkilotunnus['#text']
  );
  const age = new Date().getFullYear() - dateOfBirth.getFullYear();
  const notInTargetAgeGroup = ![16, 17].includes(age);

  const isDead = vtjData.Henkilo.Kuolintiedot.Kuollut === '1';
  return {
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
  };
};
