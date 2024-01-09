import ApplicationForm from 'benefit/handler/components/applicationForm/ApplicationForm';
import AppContext from 'benefit/handler/context/AppContext';
import DeMinimisProvider from 'benefit/handler/context/DeMinimisProvider';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import theme from 'shared/styles/theme';

const NewApplication: NextPage = () => {
  const {
    setIsFooterVisible,
    setIsNavigationVisible,
    setLayoutBackgroundColor,
  } = React.useContext(AppContext);

  // configure page specific settings
  React.useEffect(() => {
    setIsNavigationVisible(false);
    setIsFooterVisible(false);
    setLayoutBackgroundColor(theme.colors.white);
    return () => {
      setIsNavigationVisible(false);
      setIsFooterVisible(true);
      setLayoutBackgroundColor(theme.colors.white);
    };
  }, [setIsFooterVisible, setIsNavigationVisible, setLayoutBackgroundColor]);

  return (
    <DeMinimisProvider>
      <ApplicationForm />;
    </DeMinimisProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});
export default NewApplication;
