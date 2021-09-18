import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import { useTranslation } from 'next-i18next';
import { isEmpty } from 'shared/utils/string.utils';

const useWatchEmployeeDisplayName = (index: number): string => {
  const { t } = useTranslation();
  const defaultHeading = `${t(`common:application.step2.employment`)} #${
    index + 1
  }`;
  const { watch: watchEmployeeName } = useApplicationFormField<string>(`summer_vouchers.${index}.employee_name`);
  const employeeName = watchEmployeeName();
  return !employeeName || isEmpty(employeeName) ? defaultHeading : employeeName;
};
export default useWatchEmployeeDisplayName;
