import { useTranslation } from 'next-i18next';
import type ApplicationFieldName from 'shared/types/application-field-name';
import { getApplicationFormFieldLabel } from 'shared/utils/application.utils';

const useGetApplicationFormFieldLabel = (
  field: ApplicationFieldName
): string => {
  const { t } = useTranslation();
  return getApplicationFormFieldLabel(t, field);
};

export default useGetApplicationFormFieldLabel;
