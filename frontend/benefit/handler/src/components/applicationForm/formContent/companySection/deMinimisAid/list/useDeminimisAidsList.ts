import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import { useContext } from 'react';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  handleRemove: (index: number) => void;
  grants: DeMinimisAid[];
};

const useDeminimisAidsList = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections';
  const { deMinimisAids, setDeMinimisAids } = useContext(DeMinimisContext);

  const handleRemove = (index: number): void => {
    // remove value
    const currentGrants = [...deMinimisAids];
    currentGrants.splice(index, 1);
    setDeMinimisAids(currentGrants);
  };

  return {
    t,
    translationsBase,
    handleRemove,
    grants: deMinimisAids,
  };
};

export { useDeminimisAidsList };
