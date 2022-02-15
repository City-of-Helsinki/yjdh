import YouthApplication from './youth-application';
import YouthApplicationStatus from './youth-application-status';

type CreatedYouthApplication = YouthApplication & {
  receipt_confirmed_at?: string;
  id: string;
  status: YouthApplicationStatus;
};

export default CreatedYouthApplication;
