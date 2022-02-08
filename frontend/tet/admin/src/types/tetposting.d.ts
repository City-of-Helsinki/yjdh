type TetPosting = {
  id?: string;
  title: string;
  description: string;
  org_name: string;
  // TODO react-hook-forms gets this as a string from `NumberInput`
  // but NumberInput expects it as a number
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  contact_language: string;
  spots: number;
  start_date: string;
  end_date?: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_language: string;
  contact_phone: string;
  date_published?: string;
};

export type TetPostings = {
  draft: TetPosting[];
  published: TetPosting[];
};

export default TetPosting;
