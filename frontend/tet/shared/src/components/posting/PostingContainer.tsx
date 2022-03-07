import React from 'react';
import { TetData } from 'tet-shared/types/TetData';
import PostingHero from 'tet-shared/components/posting/postingHero/PostingHero';
import PostingContent from 'tet-shared/components/posting/postingContent/PostingContent';

type Props = {
  posting: TetData;
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
