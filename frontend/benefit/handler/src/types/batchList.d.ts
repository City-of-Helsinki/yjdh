type BatchTableTransforms = {
  id?: string;
  company_name?: string;
};

type BatchTableColumns = {
  isSortable?: boolean;
  key: string;
  headerName: string;
  sortIconType?: 'string' | 'other';
  transform?: ({ ...args }: TableTransforms) => string | JSX.Element;
  customSortCompareFunction?: (a: string, b: string) => void;
};
