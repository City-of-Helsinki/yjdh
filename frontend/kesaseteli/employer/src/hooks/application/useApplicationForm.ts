import { FormContextProps, getApplicationFormContext } from 'kesaseteli/employer/contexts/ApplicationFormContext';
import React from 'react'

const useApplicationForm = (): FormContextProps => React.useContext(getApplicationFormContext());

export default useApplicationForm;
