import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import LocalStorageApi from 'kesaseteli/employer/types/localstorage-api';
import useLocalStorage from 'react-use/lib/useLocalStorage';

const useStepStorage = (
  stepType: 'current' | 'last-completed'
): LocalStorageApi<number | undefined> => {
  const { applicationId } = useApplicationApi();
  return useLocalStorage<number | undefined>(
    ['application', applicationId, stepType].join('-')
  );
};

export default useStepStorage;
