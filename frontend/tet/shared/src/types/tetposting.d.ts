import { LocationType, OptionType } from 'tet-shared/types/classification';

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
  contact_phone: string;
  date_published: string | null;
  keywords: OptionType[];
  keywords_working_methods: OptionType[];
  keywords_attributes: OptionType[];
  languages: OptionType[];
  image?: File; // image file that user has selected
  image_url?: string; // this is shown to user
  image_id?: string; // if set, this becomes the TET posting's image
  photographer_name?: string;
};

export type TetPostings = {
  draft: TetPosting[];
  published: TetPosting[];
};

export default TetPosting;
