import ApplicationReports from 'benefit/handler/components/applicationReports/ApplicationReports';
import AppContext from 'benefit/handler/context/AppContext';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';

const ReportIndex: NextPage = () => {
  const { setIsNavigationVisible } = React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(true);
  }, [setIsNavigationVisible]);

  return <ApplicationReports />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ReportIndex;
