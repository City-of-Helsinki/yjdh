import TetPosting from 'tet-shared/types/tetposting';
import merge from 'lodash/merge';
import faker from 'faker';
import {
  LocalizedObject,
  TetEvent,
  CustomData,
  Place,
  TetEvents,
} from 'tet-shared/types/linkedevents';
import { formatDate } from 'shared/utils/date.utils';
import { OptionType, LocationType } from 'tet-shared/types/classification';

export const fakeLocalizedObject = (text?: string): LocalizedObject => ({
  en: text || uniqueSentences(),
  sv: text || uniqueSentences(),
  fi: text || uniqueSentences(),
});

export const getPastDate = (): string => formatDate(faker.date.past());

const sentences: string[] = [];
const uniqueSentences = (): string => {
  const sentence = faker.random.words();

  if (sentences.includes(sentence)) {
    return uniqueSentences();
  } else {
    sentences.push(sentence);
  }

  return sentence;
};

export const fakeLocation = (
  overrides?: Partial<LocationType>
): LocationType => {
  return merge<LocationType, typeof overrides>(
    {
      city: faker.address.city(),
      label: uniqueSentences(),
      name: uniqueSentences(),
      postal_code: faker.address.zipCode(),
      street_address: uniqueSentences(),
      value: faker.internet.url(),
    },
    overrides
  );
};

export const fakeOptions = (options: string[]) => {
  return options.map((option) => fakeOptionType(option));
};

export const fakeOptionType = (optionName: string): OptionType => {
  return {
    name: optionName,
    label: optionName,
    value: optionName.split(' ').join('-').toLocaleLowerCase(),
  };
};

export const fakeTetPosting = (overrides?: Partial<TetPosting>): TetPosting => {
  return merge<TetPosting, typeof overrides>(
    {
      id: faker.datatype.uuid(),
      title: uniqueSentences(),
      description: uniqueSentences(),
      org_name: uniqueSentences(),
      spots: 1,
      start_date: '10-10-2022',
      contact_email: faker.internet.email(),
      contact_first_name: faker.name.firstName(),
      contact_last_name: faker.name.lastName(),
      contact_language: 'fi',
      contact_phone: faker.phone.phoneNumber(),
      date_published: null,
      location: fakeLocation(),
      keywords: [],
      keywords_working_methods: [],
      keywords_attributes: [],
      languages: [{ label: 'Suomi', name: 'fi', value: 'fi' }],
    },
    overrides
  );
};

export const fakeCustomData = (overrides?: Partial<CustomData>): CustomData => {
  return merge<CustomData, typeof overrides>(
    {
      spots: '2',
      org_name: uniqueSentences(),
      contact_email: faker.internet.email(),
      contact_phone: faker.phone.phoneNumber(),
      contact_language: 'fi',
      contact_first_name: faker.name.firstName(),
      contact_last_name: faker.name.lastName(),
      editor_email: faker.internet.email(),
    },
    overrides
  );
};

const fakePlace = (): Place => ({
  '@id': faker.internet.url(),
  name: fakeLocalizedObject(),
  street_address: fakeLocalizedObject(),
  postal_code: faker.address.zipCode(),
  address_locality: fakeLocalizedObject(),
  position: {
    type: 'Point',
    coordinates: [
      Number(faker.address.latitude()),
      Number(faker.address.longitude()),
    ],
  },
});

export const fakeEventListAdmin = (
  draftTitles: string[],
  publishedTitles: string[]
): TetEvents => {
  const draft = draftTitles.map((draftTitle) =>
    fakeTetEvent({ name: fakeLocalizedObject(draftTitle) })
  );
  const published = publishedTitles.map((publishedTitle) =>
    fakeTetEvent({ name: fakeLocalizedObject(publishedTitle) })
  );
  return {
    draft,
    published,
  };
};

export const fakeTetEvent = (overrides?: Partial<TetEvent>): TetEvent => {
  return merge<TetEvent, typeof overrides>(
    {
      id: faker.datatype.uuid(),
      name: fakeLocalizedObject(),
      location: fakePlace(),
      description: fakeLocalizedObject(),
      short_description: fakeLocalizedObject(),
      keywords: [],
      custom_data: fakeCustomData(),
      start_time: '10-10-2022',
      end_time: null,
      date_published: null,
      created_time: null,
      last_modified_time: null,
      publication_status: 'public',
      event_status: 'EventScheduled',
      in_language: [{ '@id': faker.internet.url() }],
    },
    overrides
  );
};
