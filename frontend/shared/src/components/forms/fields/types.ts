export type Field<T = string> = {
  name: T;
  label: string;
  placeholder?: string;
  mask?: { format: string; stripVal(val: string): string };
};

export type FieldsDef = {
  [key: string]: Field;
};

export type Option = {
  label: string;
  value: string | number;
};
