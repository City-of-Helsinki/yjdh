export type Option = {
  name: string;
};

export type OptionType = Option & {
  label: string;
  value: string;
};

export type LocationType = OptionType & {
  street_address: string;
  postal_code: string;
  city: string;
  position: {
    type: string;
    coordinates: number[];
  };
};
