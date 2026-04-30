import { FinnishSSN } from 'finnish-ssn';
import { TARGET_GROUP_AGES } from 'kesaseteli-shared/constants/target-group-ages';
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

const addressIsValid = (address?: VtjAddress | null): boolean =>
  address
    ? isWithinInterval(new Date(), {
        startDate: address.AsuminenAlkupvm ?? undefined,
        endDate: address.AsuminenLoppupvm ?? undefined,
      })
    : false;

// eslint-disable-next-line sonarjs/cognitive-complexity
export const mapVtjData = (application: ActivatedYouthApplication): VtjInfo => {
  const {
    encrypted_handler_vtj_json: vtjData,
    last_name,
    postcode,
    is_vtj_data_restricted,
  } = application;
  const notFound =
    vtjData.Henkilo?.Henkilotunnus?.['@voimassaolokoodi'] !== '1';
  const providedAt = vtjData.Asiakasinfo?.InfoS ?? '';
  const fullName = `${vtjData.Henkilo?.NykyisetEtunimet?.Etunimet ?? ''} ${
    vtjData.Henkilo?.NykyinenSukunimi?.Sukunimi ?? ''
  }`.trim();
  const differentLastName =
    vtjData.Henkilo?.NykyinenSukunimi?.Sukunimi?.toLowerCase() !==
    last_name.toLowerCase();

  const socialSecurityNumber = vtjData.Henkilo?.Henkilotunnus?.['#text'] ?? '-';

  const permanentAddress = addressIsValid(
    vtjData.Henkilo?.VakinainenKotimainenLahiosoite
  )
    ? vtjData.Henkilo?.VakinainenKotimainenLahiosoite
    : undefined;
  const temporaryAddress = addressIsValid(
    vtjData.Henkilo?.TilapainenKotimainenLahiosoite
  )
    ? vtjData.Henkilo?.TilapainenKotimainenLahiosoite
    : undefined;
  const addressNotFound =
    !is_vtj_data_restricted && !permanentAddress && !temporaryAddress;

  const { LahiosoiteS, Postinumero, PostitoimipaikkaS } =
    permanentAddress ?? temporaryAddress ?? {};
  const fullAddress =
    !is_vtj_data_restricted && !addressNotFound
      ? `${LahiosoiteS ?? ''} ${Postinumero ?? ''} ${
          PostitoimipaikkaS ?? ''
        }`.trim()
      : '-';
  const outsideHelsinki =
    !is_vtj_data_restricted && PostitoimipaikkaS?.toLowerCase() !== 'helsinki';
  const differentPostCode = !is_vtj_data_restricted && Postinumero !== postcode;

  let dateOfBirth;
  try {
    dateOfBirth = FinnishSSN.parse(
      vtjData.Henkilo?.Henkilotunnus?.['#text'] ?? ''
    ).dateOfBirth;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Could not parse date of birth from VTJ data');
  }
  const age = dateOfBirth
    ? new Date().getFullYear() - dateOfBirth.getFullYear()
    : 0;
  const notInTargetAgeGroup = !TARGET_GROUP_AGES.includes(age);

  const isDead = vtjData.Henkilo?.Kuolintiedot?.Kuollut === '1';
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
