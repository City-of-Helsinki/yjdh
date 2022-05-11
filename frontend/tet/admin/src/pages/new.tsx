import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Container from 'shared/components/container/Container';
import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
import Editor from 'tet/admin/components/editor/Editor';
import { useTranslation } from 'next-i18next';
import PostingContainer from 'tet-shared/components/posting/PostingContainer';
import PreviewWrapper from 'tet/admin/components/editor/previewWrapper/PreviewWrapper';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import BackButton from 'tet/admin/components/BackButton';
import withAuth from 'shared/components/hocs/withAuth';
import HeaderLinks from 'tet-shared/components/HeaderLinks';

const NewPostingPage: NextPage = () => {
  const { t } = useTranslation();
  const { showPreview, tetPosting } = useContext(PreviewContext);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // If initial, use data from query and not from previewContext
    if (isInitialRender) setIsInitialRender(false);
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
        <Editor initialValue={isInitialRender ? undefined : tetPosting} />
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default withAuth(NewPostingPage);
