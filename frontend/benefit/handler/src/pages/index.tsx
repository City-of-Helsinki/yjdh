import ApplicationList from 'benefit/handler/components/applicationList/ApplicationList';
import MainIngress from 'benefit/handler/components/mainIngress/MainIngress';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import FrontPageProvider from 'benefit/handler/context/FrontPageProvider';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import theme from 'shared/styles/theme';

const ApplicantIndex: NextPage = () => {
  const { setIsNavigationVisible, setLayoutBackgroundColor } =
    React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(true);
    setLayoutBackgroundColor(theme.colors.silverLight);
    return () => {
      setIsNavigationVisible(false);
      setLayoutBackgroundColor(theme.colors.white);
    };
  }, [setIsNavigationVisible, setLayoutBackgroundColor]);

  const { t } = useTranslation();

  return (
    <FrontPageProvider>
      <MainIngress />
      <ApplicationList
        heading={t('common:applications.list.headings.handled')}
        status={[APPLICATION_STATUSES.HANDLED]}
      />
      <ApplicationList
        heading={t('common:applications.list.headings.received')}
        status={[APPLICATION_STATUSES.RECEIVED]}
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
