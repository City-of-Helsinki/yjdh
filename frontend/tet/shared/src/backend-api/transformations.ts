import {
  LocalizedObject,
  TetEvent,
  TetEventPayload,
  TetEvents,
} from 'tet-shared/types/linkedevents';
import TetPosting, { TetPostings } from 'tet-shared/types/tetposting';
import { KeywordFn, ClassificationType } from 'tet-shared/types/keywords';
import { OptionType } from 'tet-shared/types/classification';

export const getLocalizedString = (obj: LocalizedObject | undefined): string =>
  obj ? obj.fi : '';

export const setLocalizedString = (str: string): LocalizedObject => ({
  fi: str,
});

export const hdsDateToIsoFormat = (str: string | undefined): string | null => {
  if (!str) {
    return null;
  }
  const match = str.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    const ensurePadding = (dayOrMonth: string): string =>
      dayOrMonth.length < 2 ? `0${dayOrMonth}` : dayOrMonth;

    return `${match[3]}-${ensurePadding(match[2])}-${ensurePadding(match[1])}`;
  }

  // Returning str in case it was already in ISO format
  // If not, Linked Events will return 400
  return str;
};

export const isoDateToHdsFormat = (date: string | null): string => {
  if (!date) {
    return '';
  }

  const newDate = new Date(date);
  return `${newDate.getDate()}.${
    newDate.getMonth() + 1
  }.${newDate.getFullYear()}`;
};

/**
 * Convert event read from Linked Events API to form data.
 *
 * Event keywords (classification in posting) and address are converted to Finnish labels.
 * We could customize this by providing the function with user's locale as parameter.
 *
 * @param event
 * @param keywordType If this function is set, it is used to find classification data for the posting.
 *    Othwerwise classification data is left empty, which is okay if we don't need to show it.
 * @param languageOptions If this value is set, it is used to set language labels.
 */
export const eventToTetPosting = (
  event: TetEvent,
  keywordType?: KeywordFn,
  languageOptions?: OptionType[]
): TetPosting => {
  const parsedSpots = parseInt(event.custom_data?.spots || '', 10);
  const spots = parsedSpots >= 0 ? parsedSpots : 1;

  return {
    id: event.id,
    title: getLocalizedString(event.name),
    description: getLocalizedString(event.description),
    org_name: event.custom_data?.org_name || '',
    // TODO label is what is shown in address field
    // note that with GET /event/ all but @id are empty
    location: {
      name: getLocalizedString(event.location.name),
      label: getLocalizedString(event.location.name),
      value: event.location['@id'],
      street_address: getLocalizedString(event.location.street_address),
      city: getLocalizedString(event.location.address_locality),
      postal_code: event.location.postal_code ?? '',
    },
    start_date: isoDateToHdsFormat(event.start_time)!,
    end_date: isoDateToHdsFormat(event.end_time),
    date_published: event.date_published,
    contact_email: event.custom_data?.contact_email || '',
    contact_first_name: event.custom_data?.contact_first_name || '',
    contact_last_name: event.custom_data?.contact_last_name || '',
    contact_language: event.custom_data?.contact_language || 'fi',
    contact_phone: event.custom_data?.contact_phone || '',
    keywords: keywordType
      ? event.keywords
          .filter(
            (keyword) =>
              keywordType(keyword['@id']) === ClassificationType.KEYWORD
          )
          // note that with GET /event/ all but @id are empty
          .map((keyword) => ({
            name: getLocalizedString(keyword.name),
            label: getLocalizedString(keyword.name),
            value: keyword['@id'],
          }))
      : [],
    keywords_working_methods: keywordType
      ? event.keywords
          .filter(
            (keyword) =>
              keywordType(keyword['@id']) === ClassificationType.WORKING_METHOD
          )
          .map((keyword) => ({
            name: getLocalizedString(keyword.name),
            label: getLocalizedString(keyword.name),
            value: keyword['@id'],
          }))
      : [],
    keywords_attributes: keywordType
      ? event.keywords
          .filter(
            (keyword) =>
              keywordType(keyword['@id']) === ClassificationType.WORKING_FEATURE
          )
          .map((keyword) => ({
            name: getLocalizedString(keyword.name),
            label: getLocalizedString(keyword.name),
            value: keyword['@id'],
          }))
      : [],
    languages: languageOptions
      ? event.in_language.map((obj) => {
          const splits = obj['@id'].split('/');
          const lang = splits[splits.length - 2];
          return (
            languageOptions.find((option) => option.value === lang) || {
              name: '',
              value: lang,
              label: '',
            }
          );
        })
      : [],
    spots,
  };
};

export const eventsToTetPostings = (
  events: TetEvents | undefined
): TetPostings => {
  const postings: TetPostings = {
    draft: [],
    published: [],
  };

  if (!events) {
    return postings;
  }

  if (events.draft.length > 0) {
    postings.draft = events.draft.map((e) => eventToTetPosting(e));
  }

  if (events.published.length > 0) {
    postings.published = events.published.map((e) => eventToTetPosting(e));
  }

  return postings;
};

export const tetPostingToEvent = (posting: TetPosting): TetEventPayload => ({
  name: setLocalizedString(posting.title),
  location: { '@id': posting.location.value },
  description: setLocalizedString(posting.description),
  start_time: hdsDateToIsoFormat(posting.start_date)!,
  end_time: hdsDateToIsoFormat(posting.end_date),
  date_published: posting.date_published || null,
  keywords: [
    ...posting.keywords_working_methods.map((option) => option.value),
    ...posting.keywords_attributes.map((option) => option.value),
    ...posting.keywords.map((option) => option.value),
  ].map((url) => ({ '@id': url })),
  custom_data: {
    spots: posting.spots.toString(),
    org_name: posting.org_name,
    contact_email: posting.contact_email,
    contact_phone: posting.contact_phone,
    contact_language: posting.contact_language,
    contact_first_name: posting.contact_first_name,
    contact_last_name: posting.contact_last_name,
  },
  in_language: posting.languages.map((lang) => ({
    '@id': `http://localhost:8080/v1/language/${lang.value}/`,
  })),
});
