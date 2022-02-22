import { OptionType } from 'tet/admin/types/classification';

type TetPosting = {
  id?: string;
  title: string;
  description: string;
  org_name: string;
  location: OptionType;
  spots: number;
  start_date: string;
  end_date?: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_language: string;
  contact_phone: string;
  date_published: string | null;
  keywords: OptionType[];
  keywords_working_methods: string[];
  keywords_attributes: string[];
};

export type TetPostings = {
  draft: TetPosting[];
  published: TetPosting[];
};

export default TetPosting;
