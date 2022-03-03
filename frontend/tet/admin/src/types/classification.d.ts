import { Option } from 'tet/admin/components/editor/Combobox';

export type OptionType = Option & {
  label: string;
  value: string;
};

export enum ClassificationType {
  WORKING_METHOD = 'WORKING_METHOD',
  WORKING_FEATURE = 'WORKING_FEATURE',
  KEYWORD = 'KEYWORD',
}
export type KeywordFn = (keywordUrl: string) => ClassificationType;
