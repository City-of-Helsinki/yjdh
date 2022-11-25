import React, { useContext, useEffect, useState } from 'react';
import Container from 'shared/components/container/Container';
import BackButton from 'tet/admin/components/BackButton';
import Editor from 'tet/admin/components/editor/Editor';
import PreviewWrapper from 'tet/admin/components/editor/previewWrapper/PreviewWrapper';
import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import PostingContainer from 'tet-shared/components/posting/PostingContainer';
import TetPosting from 'tet-shared/types/tetposting';

type EditByIdProps = {
  title: string;
  data: TetPosting;
};

const EditById: React.FC<EditByIdProps> = ({ title, data }) => {
  const { showPreview, tetPosting } = useContext(PreviewContext);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // If initial, use data from query and not from previewContext
    if (isInitialRender) setIsInitialRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showPreview) {
    return (
      <PreviewWrapper posting={isInitialRender ? data : tetPosting}>
        <PostingContainer posting={tetPosting} />
      </PreviewWrapper>
    );
  }
  return (
    <Container>
      <BackButton />
      <$HeadingContainer>
        <$Heading>{title}</$Heading>
      </$HeadingContainer>
      <Editor initialValue={isInitialRender ? data : tetPosting} />
    </Container>
  );
};

export default EditById;
