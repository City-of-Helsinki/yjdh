import type Application from 'kesaseteli-shared/types/application';
import type Employment from 'kesaseteli-shared/types/employment';

type DraftApplication = Omit<Partial<Application>, 'id' | 'summer_vouchers'> & {
  id: string;
  summer_vouchers?: Partial<Employment>[];
};

export default DraftApplication;
