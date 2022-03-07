import React, { useContext, useState, useEffect } from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import Editor from 'tet/admin/components/editor/Editor';
import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
import PreviewWrapper from 'tet/admin/components/editor/previewWrapper/PreviewWrapper';
import PostingContainer from 'tet/shared/src/components/posting/PostingContainer';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import Container from 'shared/components/container/Container';
import BackButton from 'tet/admin/components/BackButton';

type EditByIdProps = {
  title: string;
  data: TetPosting;
};

const EditById: React.FC<EditByIdProps> = ({ title, data }) => {
  const { showPreview, tetPosting, getTemplateData } = useContext(PreviewContext);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // If initial, use data from query and not from previewContext
    if (isInitialRender) setIsInitialRender(false);
  }, []);

  const templateData = getTemplateData();

  if (showPreview) {
    return (
      <PreviewWrapper>
        <PostingContainer posting={templateData} />
      </PreviewWrapper>
    );
  }
  return (
    <>
      <Container>
        <BackButton />
        <$HeadingContainer>
          <$Heading>{title}</$Heading>
        </$HeadingContainer>
        <Editor initialValue={isInitialRender ? data : tetPosting} />
      </Container>
    </>
  );
};

export default EditById;
