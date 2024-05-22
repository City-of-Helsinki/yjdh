import AlterationHandling from 'benefit/handler/components/alterationHandling/AlterationHandling';
import AppContext from 'benefit/handler/context/AppContext';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect } from 'react';
import theme from 'shared/styles/theme';

const HandleAlterationPage: React.FC = () => {
  const {
    setIsFooterVisible,
    setIsNavigationVisible,
    setLayoutBackgroundColor,
  } = React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(false);
    setIsFooterVisible(false);
    setLayoutBackgroundColor(theme.colors.white);
    return () => {
      setIsNavigationVisible(false);
      setIsFooterVisible(true);
      setLayoutBackgroundColor(theme.colors.white);
    };
  }, [setIsFooterVisible, setIsNavigationVisible, setLayoutBackgroundColor]);

  return <AlterationHandling />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default HandleAlterationPage;
