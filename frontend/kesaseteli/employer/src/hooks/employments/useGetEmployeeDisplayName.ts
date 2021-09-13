import { useTranslation } from 'next-i18next';
import { useFormContext } from 'react-hook-form';
import Application from 'shared/types/employer-application';
import { isEmpty } from 'shared/utils/string.utils';

const useGetEmployeeDisplayName = (index: number): string => {
  const { t } = useTranslation();
  const defaultHeading = `${t(`common:application.step2.employment`)} #${
    index + 1
  }`;
  const { getValues } = useFormContext<Application>();
  const employeeName = getValues(`summer_vouchers.${index}.employee_name`);
  return isEmpty(employeeName) ? defaultHeading : (employeeName as string);
};
export default useGetEmployeeDisplayName;
