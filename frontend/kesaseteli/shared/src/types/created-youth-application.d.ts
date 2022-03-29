import YouthApplication from './youth-application';
import YouthApplicationStatus from './youth-application-status';

type CreatedYouthApplication = YouthApplication &
  YouthApplicationStatus & {
    id: string;
  };

export default CreatedYouthApplication;
