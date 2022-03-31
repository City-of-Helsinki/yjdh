import React, { useContext, useState, useEffect } from 'react';
import TetPosting from 'tet-shared/types/tetposting';
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
  allowDelete?: boolean;
  allowPublish?: boolean;
};

const EditById: React.FC<EditByIdProps> = ({ title, data, allowDelete = true, allowPublish = false }) => {
  const { showPreview, tetPosting } = useContext(PreviewContext);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // If initial, use data from query and not from previewContext
    if (isInitialRender) setIsInitialRender(false);
  }, []);

  if (showPreview) {
    return (
      <PreviewWrapper allowPublish={allowPublish} posting={isInitialRender ? data : tetPosting}>
        <PostingContainer posting={tetPosting} />
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
        <Editor
          initialValue={isInitialRender ? data : tetPosting}
          allowDelete={allowDelete}
          allowPublish={allowPublish}
        />
      </Container>
    </>
  );
};

export default EditById;
