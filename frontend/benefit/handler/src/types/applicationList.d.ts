import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { AhjoError } from 'benefit-shared/types/application';

export interface ApplicationListTableTransforms {
  id?: string;
  companyName?: string;
  unreadMessagesCount?: number;
  additionalInformationNeededBy?: string | Date;
  status?: APPLICATION_STATUSES;
  applicationOrigin?: APPLICATION_ORIGINS;
  ahjoError: AhjoError;
}

export interface ApplicationListTableColumns {
  isSortable?: boolean;
  key: string;
  headerName: string;
  sortIconType?: 'string' | 'other';
  transform?: ({ ...args }: TableTransforms) => string | JSX.Element;
  customSortCompareFunction?: (a: string, b: string) => void;
}
