import { ROUTES } from 'benefit/applicant/constants';
import AppContext from 'benefit/applicant/context/AppContext';
import FrontPageContext from 'benefit/applicant/context/FrontPageContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { SubmittedApplication } from 'benefit/applicant/types/application';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect } from 'react';

type ExtendedComponentProps = {
  handleNewApplicationClick: () => void;
  handleMoreInfoClick: () => void;
  handleCloseNotification: () => void;
  t: TFunction;
  errors: Error[];
  application: SubmittedApplication | null;
};

const useMainIngress = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const [application, setApplication] =
    React.useState<SubmittedApplication | null>(null);
  const { errors } = React.useContext(FrontPageContext);
  const { submittedApplication, setSubmittedApplication } =
    React.useContext(AppContext);

  useEffect(() => {
    if (submittedApplication) {
      setApplication({ ...submittedApplication });
      setSubmittedApplication(null);
    }
  }, [submittedApplication, setSubmittedApplication]);

  const handleMoreInfoClick = (): void => {
    // todo: redirect to more info url
    void router.push(ROUTES.HOME);
  };

  const handleNewApplicationClick = (): void => {
    void router.push(ROUTES.APPLICATION_FORM);
  };

  const handleCloseNotification = (): void => setApplication(null);

  return {
    handleNewApplicationClick,
    handleMoreInfoClick,
    handleCloseNotification,
    t,
    errors,
    application,
  };
};

export { useMainIngress };
