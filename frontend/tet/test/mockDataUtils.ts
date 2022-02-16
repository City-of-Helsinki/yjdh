import { TetData } from 'tet/shared/types/TetData';
import merge from 'lodash/merge';
import faker from 'faker';

export const fakeTetData = (overrides?: Partial<TetData>): TetData => {
  return merge<TetData, typeof overrides>(
    {
      title: uniqueSentences(),
      description: uniqueSentences(),
      org_name: uniqueSentences(),
      spots: 1,
      start_date: '10-10-2022',
      contact_email: 'test@test.com',
      contact_first_name: 'John',
      contact_last_name: 'Doe',
      contact_language: 'fi',
      contact_phone: '040 123 4567',
      location: {
        zip_code: '00530',
        city: 'Helsinki',
        street_address: 'Mannerheimintie 10',
      },
      keywords: [],
      keywords_working_methods: [],
      keywords_attributes: [],
    },
    overrides,
  );
};

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
