import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { getStepNumber } from 'kesaseteli/employer/utils/application-wizard.utils';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import LocalStorageApi from 'shared/types/localstorage-api';


const useStepStorage = (stepType: 'current' | 'last-visited'): LocalStorageApi<number> => {
  const { applicationId } = useApplicationApi();
  const [step, ...rest] = useLocalStorage<number>(
    ['application',applicationId,stepType].join('-')
  );
  return [getStepNumber(step), ...rest];
}

export default useStepStorage;
