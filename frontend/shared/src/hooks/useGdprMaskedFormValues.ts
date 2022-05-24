import { useFormContext } from 'react-hook-form';
import maskGDPRData from 'shared/utils/mask-gdpr-data';

const useGdprMaskedFormValues = <FormData>(): Partial<FormData> => {
  const { getValues } = useFormContext<FormData>();
  return maskGDPRData(getValues() as FormData);
};

export default useGdprMaskedFormValues;
