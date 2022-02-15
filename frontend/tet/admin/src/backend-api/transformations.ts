import { CustomData, IdObject, LocalizedObject, TetEvent, TetEvents } from 'tet/admin/types/linkedevents';
import TetPosting, { TetPostings } from 'tet/admin/types/tetposting';
import { workFeaturesDataSource, workMethodDataSource } from 'tet/admin/backend-api/linked-events-api';
export const getLocalizedString = (obj: LocalizedObject): string => obj.fi;

export const parseDataSourceFromKeywordUrl = (url: string): string => {
  const match = url.match(/(\w+):\d+\/?$/);
  return match ? match[1] : '';
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
    start_date: event.start_time,
    end_date: event.end_time || undefined,
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
