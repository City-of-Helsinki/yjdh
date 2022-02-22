import { Language } from '@frontend/shared/src/i18n/i18n';
import { convertToBackendDateFormat } from '@frontend/shared/src/utils/date.utils';
import faker from 'faker';
import { FinnishSSN } from 'finnish-ssn';

/* These are relatively resolved paths because fake-objects is used from
 *  browser-tests which do not support tsconfig
 *  https://github.com/DevExpress/testcafe/issues/4144
 */
import CreatedYouthApplication from '../../types/created-youth-application';
import YouthApplication from '../../types/youth-application';
import YouthFormData from '../../types/youth-form-data';
import { convertFormDataToApplication } from '../../utils/youth-form-data.utils';

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

export const fakeYouthFormData = (isUnlistedSchool = false): YouthFormData => ({
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
});

export const fakeYouthApplication = (language?: Language): YouthApplication =>
  convertFormDataToApplication(fakeYouthFormData(), language);

type Options = { activated?: boolean; isUnlistedSchool?: boolean };

export const fakeCreatedYouthApplication = (
  options?: Options
): CreatedYouthApplication => {
  const { activated, isUnlistedSchool } = {
    activated: true,
    isUnlistedSchool: false,
    ...options,
  };
  return {
    id: faker.datatype.uuid(),
    receipt_confirmed_at: activated
      ? convertToBackendDateFormat(faker.date.past())
      : undefined,
    ...convertFormDataToApplication(fakeYouthFormData(isUnlistedSchool)),
  };
};
