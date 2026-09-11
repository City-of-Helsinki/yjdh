import type ApplicationFieldName from 'kesaseteli-shared/types/application-field-name';
import { getApplicationFormFieldLabel } from 'kesaseteli-shared/utils/application.utils';
import { useTranslation } from 'next-i18next';

const useGetApplicationFormFieldLabel = (
  field: ApplicationFieldName
): string => {
  const { t } = useTranslation();
  return getApplicationFormFieldLabel(t, field);
};

export default useGetApplicationFormFieldLabel;
