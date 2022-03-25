import { getRandomSubArray } from '@frontend/shared/src/__tests__/utils/fake-objects';
import { Language } from '@frontend/shared/src/i18n/i18n';
import { convertToBackendDateFormat } from '@frontend/shared/src/utils/date.utils';
import faker from 'faker';
import { FinnishSSN } from 'finnish-ssn';

/* These are relatively resolved paths because fake-objects is used from
 *  browser-tests which do not support tsconfig
 *  https://github.com/DevExpress/testcafe/issues/4144
 */
import { ADDITIONAL_INFO_REASON_TYPE } from '../../constants/additional-info-reason-type';
import ActivatedYouthApplication from '../../types/activated-youth-application';
import AdditionalInfoApplication from '../../types/additional-info-application';
import AdditionalInfoFormData from '../../types/additional-info-form-data';
import AdditionalInfoReasonOption from '../../types/additional-info-reason-option';
import CreatedYouthApplication from '../../types/created-youth-application';
import YouthApplication from '../../types/youth-application';
import YouthFormData from '../../types/youth-form-data';
import { convertFormDataToApplication as convertAdditionalInfoFormDataToApplication } from '../../utils/additional-info-form-data.utils';
import { convertFormDataToApplication as convertYouthFormDataToApplication } from '../../utils/youth-form-data.utils';

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

export const fakeYouthFormData = (
  override?: Partial<YouthApplication>
): YouthFormData => {
  const { isUnlistedSchool } = { isUnlistedSchool: false, ...override };
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.findName(),
    social_security_number: FinnishSSN.createWithAge(
      faker.datatype.number({ min: 15, max: 16 })
    ),
    postcode: faker.datatype.number({ min: 10_000, max: 99_999 }).toString(),
    selectedSchool: { name: faker.random.arrayElement(fakeSchools) },
    unlistedSchool: isUnlistedSchool ? faker.commerce.department() : undefined,
    is_unlisted_school: isUnlistedSchool,
    phone_number: faker.phone.phoneNumber('+358#########'),
    email: faker.internet.email(),
    termsAndConditions: true,
    ...override,
  };
};

export const fakeYouthApplication = (language?: Language): YouthApplication =>
  convertYouthFormDataToApplication(fakeYouthFormData(), language);

export const fakeCreatedYouthApplication = (
  override?: Partial<CreatedYouthApplication>
): CreatedYouthApplication => {
  const { status } = {
    status: 'submitted' as CreatedYouthApplication['status'],
    ...override,
  };
  return {
    id: faker.datatype.uuid(),
    status,
    ...convertYouthFormDataToApplication(fakeYouthFormData(override)),
    ...override,
  };
};

export const fakeAdditionalInfoFormData = (
  override?: Partial<AdditionalInfoFormData>
): AdditionalInfoFormData => ({
  id: faker.datatype.uuid(),
  additional_info_user_reasons: getRandomSubArray(
    ADDITIONAL_INFO_REASON_TYPE
  ).map((value) => ({
    name: value,
    label: value as string,
  })) as AdditionalInfoReasonOption[],
  additional_info_description: faker.lorem.paragraph(1),
  additional_info_attachments: [],
  ...override,
});

export const fakeAdditionalInfoApplication = (
  language?: Language
): AdditionalInfoApplication =>
  convertAdditionalInfoFormDataToApplication(
    fakeAdditionalInfoFormData(),
    language
  );

export const fakeActivatedYouthApplication = (
  override?: Partial<ActivatedYouthApplication>
): ActivatedYouthApplication => ({
  ...fakeCreatedYouthApplication(override),
  ...convertAdditionalInfoFormDataToApplication(
    fakeAdditionalInfoFormData({
      ...override,
      additional_info_user_reasons: (
        override?.additional_info_user_reasons ?? []
      ).map((reason) => ({ name: reason, label: '' })),
    }),
    override?.language
  ),
  ...override,
  receipt_confirmed_at: convertToBackendDateFormat(
    override?.receipt_confirmed_at ?? faker.date.past()
  ),
  additional_info_provided_at:
    override?.status === 'additional_information_provided'
      ? convertToBackendDateFormat(
          override?.additional_info_provided_at ?? faker.date.past()
        )
      : undefined,
});
