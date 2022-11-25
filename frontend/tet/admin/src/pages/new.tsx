import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import React, { useContext, useEffect, useState } from 'react';
import Container from 'shared/components/container/Container';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import BackButton from 'tet/admin/components/BackButton';
import Editor from 'tet/admin/components/editor/Editor';
import PreviewWrapper from 'tet/admin/components/editor/previewWrapper/PreviewWrapper';
import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import HeaderLinks from 'tet-shared/components/HeaderLinks';
import PostingContainer from 'tet-shared/components/posting/PostingContainer';

const NewPostingPage: NextPage = () => {
  const { t } = useTranslation();
  const { showPreview, tetPosting } = useContext(PreviewContext);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // If initial, use data from query and not from previewContext
    if (isInitialRender) setIsInitialRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showPreview) {
    return (
      <>
        <HeaderLinks />
        <PreviewWrapper posting={isInitialRender ? undefined : tetPosting}>
          <PostingContainer posting={tetPosting} />
        </PreviewWrapper>
      </>
    );
  }

  return (
    <>
      <HeaderLinks />
      <Container>
        <BackButton />
        <$HeadingContainer>
          <$Heading>{t('common:editor.newTitle')}</$Heading>
        </$HeadingContainer>
        <Editor initialValue={isInitialRender ? undefined : tetPosting} isNewPosting />
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default withAuth(NewPostingPage);
