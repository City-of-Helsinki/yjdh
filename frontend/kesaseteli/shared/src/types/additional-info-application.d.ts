import AdditionalInfoException from './additional-info-exception';
import AdditionalInfoFormData from './additional-info-form-data';

type AdditionalInfoApplication = Omit<AdditionalInfoFormData, 'titleType'> & {
  title_type: AdditionalInfoException;
};

export default AdditionalInfoApplication;
