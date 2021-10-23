import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useLocalStorage from 'react-use/lib/useLocalStorage';

type AccordionState = {
  storageValue: boolean;
  persistToStorage: (isOpen: boolean) => void;
  removeFromStorage: () => void;
};

const useAccordionStateLocalStorage = (
  accordionIndex: number
): AccordionState => {
  const { applicationId, applicationQuery } = useApplicationApi((application) => application.summer_vouchers[accordionIndex].id)
  const employerId = applicationQuery.isSuccess ? applicationQuery.data : undefined;
  const key = ['application',applicationId, employerId].join('-')
  const [value, setValue, removeFromStorage] = useLocalStorage(
    key,
    true
  );
  return {
    storageValue: Boolean(value),
    persistToStorage: (isOpen) => setValue(isOpen),
    removeFromStorage,
  };
};

export default useAccordionStateLocalStorage;
