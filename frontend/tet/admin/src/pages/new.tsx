import { useContext } from 'react';
import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Container from 'shared/components/container/Container';
import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
import Editor from 'tet/admin/components/editor/Editor';
import { useTranslation } from 'next-i18next';
import PostingContainer from 'tet/shared/src/components/posting/PostingContainer';
import PreviewWrapper from 'tet/admin/components/editor/previewWrapper/PreviewWrapper';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import BackButton from 'tet/admin/components/BackButton';

const NewPostingPage: NextPage = () => {
  const { t } = useTranslation();
  const { showPreview, getTemplateData } = useContext(PreviewContext);

  const data = getTemplateData();

  if (showPreview) {
    return (
      <PreviewWrapper>
        <PostingContainer posting={data} />
      </PreviewWrapper>
    );
  }

  return (
    <Container>
      <BackButton />
      <$HeadingContainer>
        <$Heading>{t('common:editor.newTitle')}</$Heading>
      </$HeadingContainer>
      <Editor allowDelete={false} />
    </Container>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default NewPostingPage;
