import { useTranslation } from 'next-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import Application from 'shared/types/employer-application';
import { isEmpty } from 'shared/utils/string.utils';

const useGetEmployeeDisplayName = (index: number): string => {
  const { t } = useTranslation();
  const defaultHeading = `${t(`common:application.step2.employment`)} #${
    index + 1
  }`;
  const { control } = useFormContext<Application>();
  const employment = useWatch({ name: `summer_vouchers.${index}`, control });
  const employeeName = employment.employee_name;

  return isEmpty(employeeName) ? defaultHeading : (employeeName as string);
};
export default useGetEmployeeDisplayName;
