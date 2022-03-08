type Nullable<T> = T | null;

type LocationFields = {
  postal_code: string;
  name: string;
  street_address: string;
  city: string;
};

export type TetData = {
  id?: string;
  title: string;
  description: string;
  org_name: string;
  spots: number;
  start_date: string;
  end_date?: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_language: string;
  contact_phone: string;
  location: LocationFields;
  date_published?: string | null;
  keywords: string[];
  keywords_working_methods: string[];
  keywords_attributes: string[];
  languages: string[];
};
