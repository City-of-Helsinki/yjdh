import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import LocalStorageApi from 'shared/types/localstorage-api';

const useStepStorage = (
  stepType: 'current' | 'last-completed'
): LocalStorageApi<number | undefined> => {
  const { applicationId } = useApplicationApi();
  return useLocalStorage<number | undefined>(
    ['application', applicationId, stepType].join('-')
  );
};

export default useStepStorage;
