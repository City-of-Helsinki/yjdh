import { OptionType, LocationType } from 'tet/admin/types/classification';
import { OptionType as DropdownOptionType } from 'tet/admin/components/editor/Dropdown';

type TetPosting = {
  id?: string;
  title: string;
  description: string;
  org_name: string;
  location: LocationType;
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
  keywords_working_methods: OptionType[];
  keywords_attributes: OptionType[];
  languages: DropdownOptionType[];
};

export type TetPostings = {
  draft: TetPosting[];
  published: TetPosting[];
};

export default TetPosting;
