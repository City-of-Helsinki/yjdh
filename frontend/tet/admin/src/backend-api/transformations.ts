import {
  CustomData,
  IdObject,
  LocalizedObject,
  TetEvent,
  TetEventPayload,
  TetEvents,
} from 'tet/admin/types/linkedevents';
import TetPosting, { TetPostings } from 'tet/admin/types/tetposting';
import { workFeaturesDataSource, workMethodDataSource } from 'tet/admin/backend-api/linked-events-api';

export const getLocalizedString = (obj: LocalizedObject): string => obj.fi;

export const setLocalizedString = (str: string): LocalizedObject => ({
  fi: str,
});

export const parseDataSourceFromKeywordUrl = (url: string): string => {
  const match = url.match(/(\w+):\d+\/?$/);
  return match ? match[1] : '';
};

export const hdsDateToIsoFormat = (str: string | undefined): string | null => {
  if (!str) {
    return null;
  }
  const match = str.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    const ensurePadding = (dayOrMonth: string): string => (dayOrMonth.length < 2 ? `0${dayOrMonth}` : dayOrMonth);

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
  return `${newDate.getDate()}.${newDate.getMonth() + 1}.${newDate.getFullYear()}`;
};

export const eventToTetPosting = (event: TetEvent): TetPosting => {
  const parsedSpots = parseInt(event.custom_data?.spots || '', 10);
  const spots = parsedSpots >= 0 ? parsedSpots : 1;

  return {
    id: event.id,
    title: getLocalizedString(event.name),
    description: getLocalizedString(event.description),
    org_name: event.custom_data?.org_name || '',
    location: event.location['@id'],
    start_date: isoDateToHdsFormat(event.start_time)!,
    end_date: isoDateToHdsFormat(event.end_time),
    date_published: event.date_published,
    contact_email: event.custom_data?.contact_email || '',
    contact_first_name: event.custom_data?.contact_first_name || '',
    contact_last_name: event.custom_data?.contact_last_name || '',
    contact_language: event.custom_data?.contact_language || 'fi',
    contact_phone: event.custom_data?.contact_phone || '',
    keywords: event.keywords
      .map((keyword) => keyword['@id'])
      .filter((url) => ![workMethodDataSource, workFeaturesDataSource].includes(parseDataSourceFromKeywordUrl(url))),
    keywords_working_methods: event.keywords
      .map((keyword) => keyword['@id'])
      .filter((url) => parseDataSourceFromKeywordUrl(url) === workMethodDataSource),
    keywords_attributes: event.keywords
      .map((keyword) => keyword['@id'])
      .filter((url) => parseDataSourceFromKeywordUrl(url) === workFeaturesDataSource),
    spots,
  };
};

export const eventsToTetPostings = (events: TetEvents | undefined): TetPostings => {
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
  location: { '@id': 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:15321/' },
  // TODO we get location as OptionType instead of string
  // location: { '@id': posting.location },
  description: setLocalizedString(posting.description),
  start_time: hdsDateToIsoFormat(posting.start_date)!,
  end_time: hdsDateToIsoFormat(posting.end_date),
  date_published: posting.date_published,
  keywords: [
    ...posting.keywords_working_methods,
    ...posting.keywords_attributes,
    // TODO we get keywords as OptionType[] instead of string[]
    // ...posting.keywords,
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
});
