import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { DeMinimisAidGrant } from 'benefit/applicant/types/common';
import { TFunction } from 'next-i18next';
import React from 'react';
// import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  grants: DeMinimisAidGrant[];
  handleRemove: (index: number) => void;
};

const useComponent = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  const { application, setApplication } = React.useContext(ApplicationContext);

  const handleRemove = (index: number): void => {
    // remove value
    const currentGrants = [...(application?.deMinimisAidGrants || [])];
    currentGrants.splice(index, 1);
    setApplication({ ...application, deMinimisAidGrants: currentGrants });
  };

  return {
    t,
    translationsBase,
    handleRemove,
    grants: application?.deMinimisAidGrants || [],
  };
};

export { useComponent };
