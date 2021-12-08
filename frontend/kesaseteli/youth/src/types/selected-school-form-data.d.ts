import BaseYouthFormData from 'kesaseteli/youth/types/base-youth-form-data';
import School from 'kesaseteli/youth/types/School';

type SelectedSchoolFormData = BaseYouthFormData & {
  selected_school?: School;
};

export default SelectedSchoolFormData;
