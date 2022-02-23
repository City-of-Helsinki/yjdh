import { YOUTH_APPLICATION_STATUS } from '../constants/status-constants';
import YouthApplication from './youth-application';

type CreatedYouthApplication = YouthApplication & {
  receipt_confirmed_at?: string;
  id: string;
  status: typeof YOUTH_APPLICATION_STATUS[number];
};

export default CreatedYouthApplication;
