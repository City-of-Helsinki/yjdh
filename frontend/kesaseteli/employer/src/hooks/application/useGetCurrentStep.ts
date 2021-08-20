import { getStepNumber } from 'kesaseteli/employer/utils/application-wizard.utils';
import { useRouter } from 'next/router';
import { getFirstValue } from 'shared/utils/array.utils';

const useGetCurrentStep = (): number => {
  const router = useRouter();
  const step = Number(getFirstValue(router.query.step))
  return getStepNumber(step);
}
export default useGetCurrentStep;
