import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import PostingHero from 'tet-shared/components/posting/postingHero/PostingHero';
//import PostingContent from 'tet-shared/components/posting/postingContent/PostingContent';
import dynamic from 'next/dynamic';

type Props = {
  posting: TetPosting;
  showBackButton?: boolean;
};
const PostingContent = dynamic(
  () => import('tet-shared/components/posting/postingContent/PostingContent'),
  { ssr: false }
);

const PostingContainer: React.FC<Props> = ({
  posting,
  showBackButton = false,
}) => {
  return (
    <>
      <PostingHero posting={posting} showBackButton={showBackButton} />
      <PostingContent posting={posting} />
    </>
  );
};

export default PostingContainer;
