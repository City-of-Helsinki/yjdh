import YouthApplication from './youth-application';
import YouthApplicationStatusProps from './youth-application-status-props';

type CreatedYouthApplication = YouthApplication &
  YouthApplicationStatusProps & {
    id: string;
  };

export default CreatedYouthApplication;
