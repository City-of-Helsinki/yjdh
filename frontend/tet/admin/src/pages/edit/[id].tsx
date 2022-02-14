import React from 'react';
import { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Container from 'shared/components/container/Container';
import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import EditById from 'tet/admin/components/editor/EditById';

// TODO This page loads well when navigated to from the app
// but exception from BaseApp i18n is thrown when opened directly (reloading)
const EditPostingPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const id = router.query.id as string;

  return (
    <Container>
      <$HeadingContainer>
        <$Heading>{t('common:editor.editTitle')}</$Heading>
      </$HeadingContainer>
      <EditById id={id} />
    </Container>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export async function getStaticPaths(): Promise<{ paths: never[]; fallback: boolean }> {
  return {
    paths: [],
    fallback: true,
  };
}

export default EditPostingPage;
