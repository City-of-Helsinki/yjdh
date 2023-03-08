import AppContext from 'benefit/handler/context/AppContext';
import FrontPageProvider from 'benefit/handler/context/FrontPageProvider';
import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import ErrorPage from 'shared/components/pages/ErrorPage';
import theme from 'shared/styles/theme';

const ApplicantIndex: NextPage = () => {
  const {
    setIsFooterVisible,
    setIsNavigationVisible,
    setLayoutBackgroundColor,
  } = React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(true);
    setIsFooterVisible(true);
    setLayoutBackgroundColor(theme.colors.silverLight);
    return () => {
      setIsNavigationVisible(false);
      setLayoutBackgroundColor(theme.colors.white);
    };
  }, [setIsFooterVisible, setIsNavigationVisible, setLayoutBackgroundColor]);

  const { t } = useTranslation();

  return (
    <FrontPageProvider>
      <ErrorPage
        title={t('common:error.notFound.title')}
        message={t('common:error.notFound.text')}
      />
    </FrontPageProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
