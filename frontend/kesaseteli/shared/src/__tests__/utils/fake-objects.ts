import { getRandomSubArray } from '@frontend/shared/src/__tests__/utils/fake-objects';
import { DEFAULT_LANGUAGE } from '@frontend/shared/src/i18n/i18n';
import DeepPartial from '@frontend/shared/src/types/common/deep-partial';
import {
  convertDateFormat,
  convertToBackendDateFormat,
  convertToUIDateAndTimeFormat,
  DATE_FORMATS,
} from '@frontend/shared/src/utils/date.utils';
import faker from 'faker';
import { FinnishSSN } from 'finnish-ssn';
import merge from 'lodash/merge';

/* These are relatively resolved paths because fake-objects is used from
 *  browser-tests which do not support tsconfig
 *  https://github.com/DevExpress/testcafe/issues/4144
 */
import { ADDITIONAL_INFO_REASON_TYPE } from '../../constants/additional-info-reason-type';
import ActivatedYouthApplication from '../../types/activated-youth-application';
import AdditionalInfoApplication from '../../types/additional-info-application';
import AdditionalInfoReasonType from '../../types/additional-info-reason-type';
import CreatedYouthApplication from '../../types/created-youth-application';
import VtjAddress from '../../types/vtj-address';
import VtjData from '../../types/vtj-data';
import YouthApplication from '../../types/youth-application';

export const fakeSchools: string[] = [
  'Aleksis Kiven peruskoulu',
  'Apollon yhteiskoulu',
  'Arabian peruskoulu',
  'Aurinkolahden peruskoulu',
  'Botby grundskola',
  'Elias-koulu',
  'Englantilainen koulu',
  'Grundskolan Norsen',
  'Haagan peruskoulu',
  'Helsingin Juutalainen Yhteiskoulu',
  'Helsingin Kristillinen koulu',
  'Helsingin Montessori-koulu',
  'Helsingin Rudolf Steiner -koulu',
  'Helsingin Saksalainen koulu',
  'Helsingin Suomalainen yhteiskoulu',
  'Helsingin Uusi yhteiskoulu',
  'Helsingin eurooppalainen koulu',
  'Helsingin normaalilyseo',
  'Helsingin ranskalais-suomalainen koulu',
  'Helsingin yhteislyseo',
  'Helsingin yliopiston Viikin normaalikoulu',
  'Herttoniemen yhteiskoulu',
  'Hiidenkiven peruskoulu',
  'Hoplaxskolan',
  'International School of Helsinki',
  'Itäkeskuksen peruskoulu',
  'Jätkäsaaren peruskoulu',
  'Kalasataman peruskoulu',
  'Kankarepuiston peruskoulu',
  'Kannelmäen peruskoulu',
  'Karviaistien koulu',
  'Kruununhaan yläasteen koulu',
  'Kruunuvuorenrannan peruskoulu',
  'Kulosaaren yhteiskoulu',
  'Käpylän peruskoulu',
  'Laajasalon peruskoulu',
  'Latokartanon peruskoulu',
  'Lauttasaaren yhteiskoulu',
  'Maatullin peruskoulu',
  'Malmin peruskoulu',
  'Marjatta-koulu',
  'Maunulan yhteiskoulu',
  'Meilahden yläasteen koulu',
  'Merilahden peruskoulu',
  'Minervaskolan',
  'Munkkiniemen yhteiskoulu',
  'Myllypuron peruskoulu',
  'Naulakallion koulu',
  'Oulunkylän yhteiskoulu',
  'Outamon koulu',
  'Pakilan yläasteen koulu',
  'Pasilan peruskoulu',
  'Pitäjänmäen peruskoulu',
  'Pohjois-Haagan yhteiskoulu',
  'Porolahden peruskoulu',
  'Puistolan peruskoulu',
  'Puistopolun peruskoulu',
  'Pukinmäenkaaren peruskoulu',
  'Ressu Comprehensive School',
  'Ressun peruskoulu',
  'Sakarinmäen peruskoulu',
  'Solakallion koulu',
  'Sophie Mannerheimin koulu',
  'Suomalais-venäläinen koulu',
  'Suutarinkylän peruskoulu',
  'Taivallahden peruskoulu',
  'Toivolan koulu',
  'Torpparinmäen peruskoulu',
  'Töölön yhteiskoulu',
  'Valteri-koulu',
  'Vartiokylän yläasteen koulu',
  'Vesalan peruskoulu',
  'Vuoniityn peruskoulu',
  'Yhtenäiskoulu',
  'Zacharias Topeliusskolan',
  'Åshöjdens grundskola',
  'Östersundom skola',
];

const ninethGraderYear = new Date().getFullYear() - 16;
const upperSecondaryEducation1stYearStudentYear = new Date().getFullYear() - 17;

/**
 * A bit complicated algorithm that tries to find ssn with certain year of birth using `FinnishSSN.createWithAge` function.
 * We use FinnishSSN library because it's easier and less error-prone than build a custom ssn function.
 * The problem with the function is that if today is 01.06.22 and
 * - we use value `FinnishSSN.createWithAge(16)` then valid birthdays would be 2.6.2005-31.5.2006
 * - we use value `FinnishSSN.createWithAge(15)` then valid birthdays would be 1.6.2006-31.5.2007
 * The idea is to generate ssns with `FinnishSSN.createWithAge` function for 15-16 year old
 * multiple times until we find first SSN with birth year of 2006
 */
export const fakeSSN = (yearOfBirth: number): string => {
  const yearOfBirthAge = new Date().getFullYear() - yearOfBirth;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 100; i++) {
    const ssn = FinnishSSN.createWithAge(
      faker.datatype.number({ min: yearOfBirthAge - 1, max: yearOfBirthAge })
    );
    const { dateOfBirth } = FinnishSSN.parse(ssn);
    if (dateOfBirth.getFullYear() === yearOfBirth) {
      return ssn;
    }
  }
  throw new Error("Something went wrong, couldn't find any suitable ssn!");
};

export const fakeNinethGraderSSN = (): string => fakeSSN(ninethGraderYear);

export const fakeUpperSecondaryEducation1stYearStudentSSN = (): string =>
  fakeSSN(upperSecondaryEducation1stYearStudentYear);

export const fakeYouthTargetGroupAgeSSN = (): string =>
  fakeSSN(
    faker.datatype.number({
      min: upperSecondaryEducation1stYearStudentYear,
      max: ninethGraderYear,
    })
  );

type TargetGroupData = {
  social_security_number: string;
  age: number;
};

export const fakeYouthTargetGroupAge = (): TargetGroupData => {
  const social_security_number = fakeYouthTargetGroupAgeSSN();
  const { ageInYears } = FinnishSSN.parse(social_security_number);
  return {
    social_security_number,
    age: ageInYears,
  };
};

export const fakeYouthApplication = (
  override?: DeepPartial<YouthApplication>
): YouthApplication => {
  const { is_unlisted_school } = {
    is_unlisted_school: faker.datatype.boolean(),
    ...override,
  };
  return {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    social_security_number: fakeYouthTargetGroupAgeSSN(),
    postcode: faker.datatype.number({ min: 10_000, max: 99_999 }).toString(),
    school: is_unlisted_school
      ? faker.commerce.department()
      : faker.random.arrayElement(fakeSchools),
    is_unlisted_school,
    phone_number: faker.phone.phoneNumber('+358#########'),
    email: faker.internet.email(),
    language: DEFAULT_LANGUAGE,
    ...override,
  };
};

export const fakeCreatedYouthApplication = (
  override?: DeepPartial<CreatedYouthApplication>
): CreatedYouthApplication =>
  merge(
    {
      id: faker.datatype.uuid(),
      status: 'submitted',
      ...fakeYouthApplication(override),
    },
    override
  );

export const fakeAdditionalInfoApplication = (
  override?: DeepPartial<AdditionalInfoApplication>
): AdditionalInfoApplication =>
  merge(
    {
      id: faker.datatype.uuid(),
      additional_info_user_reasons:
        (override &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          (override.additional_info_user_reasons as AdditionalInfoReasonType[])) ||
        getRandomSubArray(ADDITIONAL_INFO_REASON_TYPE),
      additional_info_description: faker.lorem.paragraph(1),
      additional_info_attachments: [],
      language: override?.language ?? DEFAULT_LANGUAGE,
    },
    override
  );

export const fakeValidVtjAddress = (
  override?: DeepPartial<VtjAddress>
): VtjAddress =>
  merge(
    {
      LahiosoiteS: faker.address.streetAddress(),
      Postinumero: String(faker.datatype.number(99_999)),
      PostitoimipaikkaS: faker.address.cityName(),
      AsuminenAlkupvm: convertDateFormat(faker.date.past(), DATE_FORMATS.VTJ),
      AsuminenLoppupvm: convertDateFormat(
        faker.date.future(),
        DATE_FORMATS.VTJ
      ),
    },
    override
  );

export const fakeExpiredVtjAddress = (
  override?: DeepPartial<VtjAddress>
): VtjAddress => {
  const pastDate = faker.date.past();
  return fakeValidVtjAddress(
    merge(override, {
      AsuminenAlkupvm: convertDateFormat(
        faker.date.past(1, pastDate),
        DATE_FORMATS.VTJ
      ),
      AsuminenLoppupvm: convertDateFormat(pastDate, DATE_FORMATS.VTJ),
    })
  );
};
export const fakeFutureVtjAddress = (
  override?: DeepPartial<VtjAddress>
): VtjAddress => {
  const futureDate = faker.date.future();
  return fakeValidVtjAddress(
    merge(override, {
      AsuminenAlkupvm: convertDateFormat(futureDate, DATE_FORMATS.VTJ),
      AsuminenLoppupvm: convertDateFormat(
        faker.date.future(1, futureDate),
        DATE_FORMATS.VTJ
      ),
    })
  );
};

export const fakeVtjData = (
  override?: DeepPartial<ActivatedYouthApplication>
): VtjData =>
  merge<VtjData, DeepPartial<VtjData>>(
    {
      Asiakasinfo: {
        InfoS: convertToUIDateAndTimeFormat(faker.date.recent()),
      },
      Henkilo: {
        Henkilotunnus: {
          '@voimassaolokoodi': '1',
          '#text':
            override?.social_security_number ?? fakeYouthTargetGroupAgeSSN(),
        },
        NykyinenSukunimi: {
          Sukunimi: override?.last_name ?? faker.name.lastName(),
        },
        NykyisetEtunimet: {
          Etunimet: override?.first_name ?? faker.name.firstName(),
        },
        VakinainenKotimainenLahiosoite: fakeValidVtjAddress({
          Postinumero: override?.postcode,
          PostitoimipaikkaS: 'Helsinki',
          ...override,
        }),
        TilapainenKotimainenLahiosoite: fakeValidVtjAddress({
          Postinumero: override?.postcode,
          PostitoimipaikkaS: 'Helsinki',
          ...override,
        }),
        Kuolintiedot: {
          Kuollut: null,
        },
      },
    },
    override?.encrypted_handler_vtj_json ?? {}
  );

export const fakeActivatedYouthApplication = (
  override?: DeepPartial<ActivatedYouthApplication>
): ActivatedYouthApplication => {
  const application = merge(fakeCreatedYouthApplication(override), override);
  return merge(
    application,
    {
      ...(override?.status === 'additional_information_provided' &&
        fakeAdditionalInfoApplication(override)),
      receipt_confirmed_at: convertToBackendDateFormat(
        override?.receipt_confirmed_at ?? faker.date.recent()
      ),
      additional_info_provided_at:
        override?.status === 'additional_information_provided'
          ? convertToBackendDateFormat(
              override?.additional_info_provided_at ?? faker.date.past()
            )
          : undefined,
      encrypted_handler_vtj_json: fakeVtjData(application),
    },
    override
  );
};
