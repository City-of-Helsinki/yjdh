import ApplicationReview from 'benefit/handler/components/applicationReview/ApplicationReview';
import AppContext from 'benefit/handler/context/AppContext';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import theme from 'shared/styles/theme';

const ApplicantIndex: NextPage = () => {
  const { setIsNavigationVisible, setLayoutBackgroundColor } =
    React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(false);
    setLayoutBackgroundColor(theme.colors.white);
    return () => {
      setIsNavigationVisible(false);
      setLayoutBackgroundColor(theme.colors.white);
    };
  }, [setIsNavigationVisible, setLayoutBackgroundColor]);

  return <ApplicationReview />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
