import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { AhjoError, Instalment } from 'benefit-shared/types/application';

export interface ApplicationListTableTransforms {
  id?: string;
  companyName?: string;
  unreadMessagesCount?: number;
  additionalInformationNeededBy?: string | Date;
  status?: APPLICATION_STATUSES;
  applicationOrigin?: APPLICATION_ORIGINS;
  ahjoError: AhjoError;
  calculatedBenefitAmount?: string;
  firstInstalment?: Instalment;
  secondInstalment?: Instalment;
  alterations: ApplicationAlterationData[];
  talpaStatus?: TALPA_STATUSES;
}

export interface ApplicationListTableColumns {
  isSortable?: boolean;
  key: string;
  headerName: string;
  sortIconType?: 'string' | 'other';
  transform?: ({ ...args }: TableTransforms) => string | JSX.Element;
  customSortCompareFunction?: (a: string, b: string) => void;
}
