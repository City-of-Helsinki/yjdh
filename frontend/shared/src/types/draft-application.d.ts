import type Application from './employer-application';
import type Employment from './employment';

type DraftApplication = Omit<
  Partial<Application>,
  'id',
  'summer_vouchers'
> & { id: string; summer_vouchers?: Partial<Employment>[] };

export default DraftApplication;
