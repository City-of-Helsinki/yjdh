type TetPosting = {
  id?: string;
  title: string;
  description: string;
  org_name: string;
  address: string;
  spots: number;
  start_date: string;
  end_date?: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_language: string;
  contact_phone: string;
  date_published?: string;
  keywords: string[];
  work_methods: string[];
  work_features: string[];
};

export type TetPostings = {
  draft: TetPosting[];
  published: TetPosting[];
};

export default TetPosting;
