// eslint-disable-next-line import/no-extraneous-dependencies
import noop from 'lodash/noop';
import React from 'react';
import PostingContent from 'tet-shared/components/posting/postingContent/PostingContent';
import PostingHero from 'tet-shared/components/posting/postingHero/PostingHero';
import TetPosting from 'tet-shared/types/tetposting';

type Props = {
  posting: TetPosting;
  showBackButton?: boolean;
  onReturnClick?: () => void;
};

const PostingContainer: React.FC<Props> = ({
  posting,
  showBackButton,
  onReturnClick,
}) => (
  <>
    <PostingHero
      posting={posting}
      showBackButton={showBackButton}
      onReturnClick={onReturnClick}
    />
    <PostingContent posting={posting} />
  </>
);

PostingContainer.defaultProps = {
  showBackButton: false,
};

PostingContainer.defaultProps = {
  showBackButton: false,
  onReturnClick: () => noop,
};

export default PostingContainer;
