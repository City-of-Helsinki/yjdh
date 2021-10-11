import { getApplicationFormFieldLabel } from 'kesaseteli/employer/utils/application.utils';
import { useTranslation } from 'next-i18next';
import type ApplicationFieldName from 'shared/types/application-field-name';

const useGetApplicationFormFieldLabel = (
  field: ApplicationFieldName
): string => {
  const { t } = useTranslation();
  return getApplicationFormFieldLabel(t, field);
};

export default useGetApplicationFormFieldLabel;
