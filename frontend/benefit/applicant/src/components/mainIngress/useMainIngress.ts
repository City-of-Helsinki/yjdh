import FrontPageContext from 'benefit/applicant/context/FrontPageContext';
import React from 'react';

type ExtendedComponentProps = {
  errors: Error[];
};

const useMainIngress = (): ExtendedComponentProps => {
  const { errors } = React.useContext(FrontPageContext);

  return {
    errors,
  };
};

export { useMainIngress };
