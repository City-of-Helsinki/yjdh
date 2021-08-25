import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { TFunction } from 'next-i18next';
import React from 'react';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  attachments: [];
  handleRemove: (index: number) => void;
  handleAdd: () => void;
};

const useAttachmentsList = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';
  const { applicationTempData, setApplicationTempData } = React.useContext(
    ApplicationContext
  );

  const handleRemove = (index: number): void => {
    // remove value
    const currentGrants = [...(applicationTempData.deMinimisAids || [])];
    currentGrants.splice(index, 1);
    setApplicationTempData({
      ...applicationTempData,
      deMinimisAids: currentGrants,
    });
  };

  const handleAdd = (): void => {
    // add value
    const currentGrants = [...(applicationTempData.deMinimisAids || [])];
    currentGrants.splice(1, 1);
    setApplicationTempData({
      ...applicationTempData,
      deMinimisAids: currentGrants,
    });
  };

  return {
    t,
    translationsBase,
    handleRemove,
    handleAdd,
    attachments: [],
  };
};

export { useAttachmentsList };
