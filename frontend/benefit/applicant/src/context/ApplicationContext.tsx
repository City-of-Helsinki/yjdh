import { ApplicationTempData } from 'benefit/applicant/types/application';
import noop from 'lodash/noop';
import React from 'react';

export type ApplicationContextType = {
  applicationTempData: ApplicationTempData;
  isLoading: boolean;
  setApplicationTempData: (data: ApplicationTempData) => void;
};

const ApplicationContext = React.createContext<ApplicationContextType>({
  applicationTempData: {
    id: '',
    deMinimisAids: [],
  },
  isLoading: true,
  setApplicationTempData: noop,
});

export default ApplicationContext;
