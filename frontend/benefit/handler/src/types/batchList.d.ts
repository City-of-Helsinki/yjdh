import { TALPA_STATUSES } from 'benefit-shared/constants';

type BatchTableTransforms = {
  id?: string;
  company_name?: string;
  talpa_status?: TALPA_STATUSES;
};

type BatchTableColumns = {
  isSortable?: boolean;
  key: string;
  headerName: string;
  sortIconType?: 'string' | 'other';
  transform?: ({ ...args }: TableTransforms) => string | JSX.Element;
  customSortCompareFunction?: (a: string, b: string) => void;
};
