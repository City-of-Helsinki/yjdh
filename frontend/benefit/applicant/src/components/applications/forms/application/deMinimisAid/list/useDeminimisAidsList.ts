import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { DeMinimisAid } from 'benefit-shared/types/application';
import sumBy from 'lodash/sumBy';
import { TFunction } from 'next-i18next';
import React from 'react';
// import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  grants: DeMinimisAid[];
  deMinimisTotal: () => number;
  handleRemove: (index: number) => void;
};

const useDeminimisAidsList = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  const { deMinimisAids, setDeMinimisAids } =
    React.useContext(DeMinimisContext);

  const handleRemove = (index: number): void => {
    // remove value
    const currentGrants = [...deMinimisAids];
    currentGrants.splice(index, 1);
    setDeMinimisAids(currentGrants);
  };
  const deMinimisTotal = (): number =>
    sumBy(deMinimisAids, (grant) => Number(grant.amount));

  return {
    t,
    translationsBase,
    handleRemove,
    deMinimisTotal,
    grants: deMinimisAids,
  };
};

export { useDeminimisAidsList };
