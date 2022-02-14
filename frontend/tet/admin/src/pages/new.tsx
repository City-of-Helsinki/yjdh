import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Container from 'shared/components/container/Container';
import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
import Editor from 'tet/admin/components/editor/Editor';
import { useTranslation } from 'next-i18next';

const NewPostingPage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <$HeadingContainer>
        <$Heading>{t('common:editor.newTitle')}</$Heading>
      </$HeadingContainer>
      <Editor />
    </Container>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default NewPostingPage;
