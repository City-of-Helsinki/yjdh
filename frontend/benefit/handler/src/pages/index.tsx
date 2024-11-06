import AppContext from 'benefit/handler/context/AppContext';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import theme from 'shared/styles/theme';

import HandlerIndex from '../components/applicationList/HandlerIndex';
import HandlerIndexManual from '../components/applicationList/HandlerIndexManual';
import { useApplicationListData } from '../components/applicationList/useApplicationListData';
import { ALL_APPLICATION_STATUSES } from '../constants';

const ApplicantIndex: NextPage = () => {
  const {
    setIsFooterVisible,
    setIsNavigationVisible,
    setLayoutBackgroundColor,
    layoutBackgroundColor,
  } = React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(true);
    setIsFooterVisible(true);
    setLayoutBackgroundColor(theme.colors.silverLight);
    return () => {
      setIsNavigationVisible(false);
      setLayoutBackgroundColor(theme.colors.silver);
    };
  }, [setIsFooterVisible, setIsNavigationVisible, setLayoutBackgroundColor]);

  const isNewAhjoMode = useDetermineAhjoMode();

  const { list, shouldShowSkeleton } = useApplicationListData(
    ALL_APPLICATION_STATUSES,
    !isNewAhjoMode
  );

  return isNewAhjoMode ? (
    <HandlerIndex
      list={list}
      isLoading={shouldShowSkeleton}
      layoutBackgroundColor={layoutBackgroundColor}
    />
  ) : (
    <HandlerIndexManual
      list={list}
      isLoading={shouldShowSkeleton}
      layoutBackgroundColor={layoutBackgroundColor}
    />
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
