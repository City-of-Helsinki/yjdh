import AlterationList from 'benefit/handler/components/alterationList/AlterationList';
import { $Heading } from 'benefit/handler/components/alterationList/AlterationList.sc';
import AppContext from 'benefit/handler/context/AppContext';
import useApplicationAlterationsQuery from 'benefit/handler/hooks/useApplicationAlterationsQuery';
import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

const AlterationsPage: NextPage = () => {
  const {
    setIsFooterVisible,
    setIsNavigationVisible,
    setLayoutBackgroundColor,
  } = React.useContext(AppContext);
  const { t } = useTranslation();

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

  const { data, isLoading } = useApplicationAlterationsQuery();

  return (
    <Container>
      <$Heading>{t('common:applications.alterations.list.heading')}</$Heading>
      <AlterationList
        isLoading={isLoading}
        list={data || []}
        heading={t(`common:applications.alterations.list.all`)}
      />
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default AlterationsPage;
