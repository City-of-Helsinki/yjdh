import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import PostingHero from 'tet/shared/components/posting/postingHero/PostingHero';
import PostingContent from 'tet/shared/components/posting/postingContent/PostingContent';

type Props = {
  posting: TetPosting;
};

const PostingContainer: React.FC<Props> = ({ posting }) => {
  return (
    <>
      <PostingHero posting={posting} />
      <PostingContent posting={posting} />
    </>
  );
};

export default PostingContainer;
