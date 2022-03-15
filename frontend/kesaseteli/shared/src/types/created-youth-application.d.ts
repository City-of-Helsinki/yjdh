import YouthApplication from './youth-application';
import YouthApplicationStatus from './youth-application-status';

type CreatedYouthApplication = YouthApplication &
  YouthApplicationStatus & {
    id: string;
    receipt_confirmed_at?: string;
  };

export default CreatedYouthApplication;
