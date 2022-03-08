import { ROUTES } from 'benefit/applicant/constants';
import FrontPageContext from 'benefit/applicant/context/FrontPageContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React from 'react';

type ExtendedComponentProps = {
  handleNewApplicationClick: () => void;
  handleMoreInfoClick: () => void;
  t: TFunction;
  errors: Error[];
};

const useMainIngress = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const { errors } = React.useContext(FrontPageContext);

  const handleMoreInfoClick = (): void => {
    // todo: redirect to more info url
    void router.push(ROUTES.HOME);
  };

  const handleNewApplicationClick = (): void => {
    void router.push(ROUTES.APPLICATION_FORM);
  };

  return {
    handleNewApplicationClick,
    handleMoreInfoClick,
    t,
    errors,
  };
};

export { useMainIngress };
