/* TODO
 * These types will mainly go to tet/shared and currently contain more information for testing purposes
 * that the actual youth frontend needs.
 */

export type LinkedEventsPagedResponse<T> = {
  meta: {
    count: number;
    next: string;
    previous: string;
  };
  data: T[];
};

export type LocalizedObject = {
  fi: string;
  en?: string;
  sv?: string;
};

export type IdObject = {
  '@id': string;
};

export type Keyword = {
  name: LocalizedObject;
};

type Place = {
  name: LocalizedObject;
  street_address: LocalizedObject;
  postal_code: string;
  address_locality: LocalizedObject;
  position: {
    type: string;
    coordinates: number[];
  };
  '@id': string;
};

export type CustomData = {
  spots: string;
  org_name: string;
  contact_email: string;
  contact_phone: string;
  contact_language: string;
  contact_first_name: string;
  contact_last_name: string;
  editor_email: string;
};

export type TetEvent = {
  id: string;
  name: LocalizedObject;
  location: IdObject;
  description: LocalizedObject;
  short_description: LocalizedObject;
  keywords: IdObject[];
  custom_data: CustomData | null;
  start_time: string;
  end_time: string | null;
  date_published: string | null;
  created_time: string | null;
  last_modified_time: string | null;
  event_status: string;
  publication_status: string;
};
