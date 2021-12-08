import BaseYouthFormData from 'kesaseteli/youth/types/base-youth-form-data';

type UnlistedSchoolFormData = BaseYouthFormData & {
  unlisted_school: string;
};

export default UnlistedSchoolFormData;
