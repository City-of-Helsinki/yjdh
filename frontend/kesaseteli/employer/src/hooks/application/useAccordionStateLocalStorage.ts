import { useFormContext } from 'react-hook-form';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import Application from 'shared/types/application-form-data';

type AccordionState = {
  storageValue: boolean;
  persistToStorage: (isOpen: boolean) => void;
  removeFromStorage: () => void;
};

const useAccordionStateLocalStorage = (
  accordionIndex: number
): AccordionState => {
  const { getValues } = useFormContext<Application>();
  const application = getValues();
  const employment = application.summer_vouchers[accordionIndex];
  const [value, setValue, removeFromStorage] = useLocalStorage<boolean>(
    `application-${application.id}-${employment.id}`,
    true
  );
  return {
    storageValue: Boolean(value),
    persistToStorage: (isOpen) => setValue(isOpen),
    removeFromStorage,
  };
};

export default useAccordionStateLocalStorage;
