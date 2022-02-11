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

export type TetEvent = {
  id: string;
  name: LocalizedObject;
  description: LocalizedObject;
  short_description: LocalizedObject;
  keywords: IdObject[];
};
