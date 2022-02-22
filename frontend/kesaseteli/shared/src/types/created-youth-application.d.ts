import YouthApplication from './youth-application';

type CreatedYouthApplication = YouthApplication & {
  receipt_confirmed_at?: string;
  id: string;
};

export default CreatedYouthApplication;
