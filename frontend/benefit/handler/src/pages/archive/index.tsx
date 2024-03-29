import ApplicationsArchive from 'benefit/handler/components/applicationsArchive/ApplicationsArchive';
import AppContext from 'benefit/handler/context/AppContext';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import theme from 'shared/styles/theme';

const ArchiveIndex: NextPage = () => {
  const {
    setIsFooterVisible,
    setIsNavigationVisible,
    setLayoutBackgroundColor,
  } = React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(true);
    setIsFooterVisible(true);
    setLayoutBackgroundColor(theme.colors.white);
    return () => {
      setIsNavigationVisible(false);
      setIsFooterVisible(true);
      setLayoutBackgroundColor(theme.colors.white);
    };
  }, [setIsFooterVisible, setIsNavigationVisible, setLayoutBackgroundColor]);

  return <ApplicationsArchive />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ArchiveIndex;
