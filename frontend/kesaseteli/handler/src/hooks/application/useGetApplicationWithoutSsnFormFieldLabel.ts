/**
 * TODO: YJDH-701, refactor to reduce code duplication, copied and modified from:
 *       frontend/kesaseteli/employer/src/hooks/application/useGetApplicationFormFieldLabel.ts
 */
import type { ApplicationWithoutSsnFieldName } from 'kesaseteli/handler/types/application-without-ssn-types';
import { getApplicationWithoutSsnFormFieldLabel } from 'kesaseteli/handler/utils/application-without-ssn.utils';
import { useTranslation } from 'next-i18next';

const useGetApplicationWithoutSsnFormFieldLabel = (
  field: ApplicationWithoutSsnFieldName
): string => {
  const { t } = useTranslation();
  return getApplicationWithoutSsnFormFieldLabel(t, field);
};

export default useGetApplicationWithoutSsnFormFieldLabel;
