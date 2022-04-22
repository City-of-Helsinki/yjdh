// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import PostingContent from 'tet-shared/components/posting/postingContent/PostingContent';
import PostingHero from 'tet-shared/components/posting/postingHero/PostingHero';
import TetPosting from 'tet-shared/types/tetposting';

type Props = {
  posting: TetPosting;
  showBackButton?: boolean;
};

const PostingContainer: React.FC<Props> = ({ posting, showBackButton }) => (
  <>
    <PostingHero posting={posting} showBackButton={showBackButton} />
    <PostingContent posting={posting} />
  </>
);

PostingContainer.defaultProps = {
  showBackButton: false,
};

export default PostingContainer;
