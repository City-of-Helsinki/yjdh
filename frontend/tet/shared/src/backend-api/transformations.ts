/*
 * Implements transformations between
 *   - Linked Events and HDS date formats
 *   - transforming form data to an event (Linked Events)
 *
 * Transforming events to TET postings (used as form data or display data) is implemented in
 * `tet-shared/hooks/backend/useEventPostingTransformation` because it needs access to hooks,
 * while this file contains plain functions that operate solely on the data passed to them.
 */

import {
  LocalizedObject,
  TetEventPayload,
} from 'tet-shared/types/linkedevents';
import TetPosting from 'tet-shared/types/tetposting';

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

export const ensureScheme = (url: string | undefined) => {
  if (!url) {
    return '';
  }
  return /^https?:/i.test(url) ? url : `http://${url}`;
};

export const tetPostingToEvent = (
  posting: TetPosting,
  publish = false
): TetEventPayload => ({
  name: setLocalizedString(posting.title),
  location: { '@id': posting.location.value },
  description: setLocalizedString(posting.description),
  start_time: hdsDateToIsoFormat(posting.start_date) ?? '',
  end_time: hdsDateToIsoFormat(posting.end_date),
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
    contact_first_name: posting.contact_first_name,
    contact_last_name: posting.contact_last_name,
    website_url: ensureScheme(posting.website_url),
  },
  in_language: posting.languages.map((lang) => ({
    '@id': `http://localhost:8080/v1/language/${lang.value}/`,
  })),
  publication_status: publish ? 'public' : undefined,
  date_published: publish
    ? new Date().toISOString()
    : posting.date_published || null,
});
