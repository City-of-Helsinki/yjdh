/* TODO
 * This will go to tet/shared (copied from tet/youth TETP-73 branch)
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
  id?: string;
  '@id': string;
  name?: LocalizedObject;
};

export type Keyword = {
  name: LocalizedObject;
};

type Place = IdObject & {
  name: LocalizedObject;
  street_address: LocalizedObject;
  postal_code: string;
  address_locality: LocalizedObject;
  position: {
    type: string;
    coordinates: number[];
  };
};

export type CustomData = {
  spots: string;
  org_name: string;
  contact_email: string;
  contact_phone: string;
  contact_first_name: string;
  contact_last_name: string;
  editor_email?: string;
  website_url?: string;
};

export type TetEvent = {
  id: string;
  name: LocalizedObject;
  location: Place;
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
  in_language: IdObject[];
  provider: LocalizedObject;
};

export type TetEventPayload = {
  name: LocalizedObject;
  location: IdObject;
  description: LocalizedObject;
  keywords: IdObject[];
  custom_data: CustomData;
  start_time: string;
  end_time: string | null;
  date_published: string | null;
  publication_status?: string;
  in_language: IdObject[];
};

export type TetUpsert = {
  id?: string;
  event: TetEventPayload;
  publish?: boolean;
};

export type TetEvents = {
  draft: TetEvent[];
  published: TetEvent[];
};

export type ErrorData = {
  data?: Record<string, string[]>;
};

export type LocalizedError = {
  fi?: string[];
  en?: string[];
  sv?: string[];
};

export type LocalizedErrorData = {
  data?: Record<string, LocalizedError>;
};

export type LinkedEventsError = ErrorData | LocalizedErrorData;
