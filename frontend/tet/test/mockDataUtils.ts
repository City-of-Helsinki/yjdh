import { TetData } from 'tet/shared/types/TetData';
import merge from 'lodash/merge';

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
    },
    overrides,
  );
};

/**
 * TODO Get to work with faker {@link https://github.com/faker-js/faker}
 */
const uniqueSentences = (): string => {
  return 'word_a word_b';
};
