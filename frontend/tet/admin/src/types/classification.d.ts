import { Option } from 'tet/admin/components/editor/Combobox';

export type OptionType = Option & {
  label: string;
  value: string;
};

export type LocationType = OptionType & {
  street_address: string;
  postal_code: string;
  city: string;
};
