import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';

const useWatchEmployeeDisplayName = (index: number): string => {
  const { t } = useTranslation();
  const defaultHeading = `${t(`common:application.step2.employment`)} #${
    index + 1
  }`;
  const { watch: watchEmployeeName } = useApplicationFormField<string>(
    `summer_vouchers.${index}.employee_name`
  );
  const employeeName = watchEmployeeName();
  return isEmpty(employeeName) ? defaultHeading : employeeName;
};
export default useWatchEmployeeDisplayName;
