import React, { Fragment } from 'react';
import { LoadingSpinner } from 'hds-react';
import JobPostingCard from 'tet/youth/components/jobPostingCard/JobPostingCard';
import { useTranslation } from 'next-i18next';
import Container from 'shared/components/container/Container';
import { Button } from 'hds-react';
import { eventToTetPosting } from 'tet-shared/backend-api/transformations';
import { $ButtonLoaderContainer } from './JobPostingList.sc';
import useLanguageOptions from 'tet-shared/hooks/translation/useLanguageOptions';
import useKeywordType from 'tet-shared/hooks/backend/useKeywordType';
import { TetEvent, LinkedEventsPagedResponse } from 'tet-shared/types/linkedevents';
import { InfiniteData } from 'react-query';

type Props = {
  postings: InfiniteData<LinkedEventsPagedResponse<TetEvent>>;
  onShowMore: () => void;
  isFetchingNextPage: Boolean;
  hasNextPage?: Boolean;
};

const JobPostingList: React.FC<Props> = ({ postings, onShowMore, isFetchingNextPage, hasNextPage }) => {
  const { t } = useTranslation();
  const keywordResult = useKeywordType();
  const languageOptions = useLanguageOptions();
  const eventsToPostings = (events: TetEvent[]) =>
    events.map((event) => eventToTetPosting(event, keywordResult.getKeywordType, languageOptions));
  const total = postings?.pages[0].meta.count;

  return (
    <Container>
      <h2>{t('common:postings.searchResults', { count: total })}</h2>
      {postings?.pages.map((group: LinkedEventsPagedResponse<TetEvent>, i: number) => {
        console.log('group', group);
        return (
          <Fragment key={i}>
            {eventsToPostings(group.data).map((posting) => (
              <JobPostingCard jobPosting={posting} />
            ))}
          </Fragment>
        );
      })}
      {hasNextPage && (
        <$ButtonLoaderContainer>
          {isFetchingNextPage ? (
            <LoadingSpinner />
          ) : (
            <Button onClick={onShowMore}>{t('common:postings.showMore')}</Button>
          )}
        </$ButtonLoaderContainer>
      )}
    </Container>
  );
};

export default JobPostingList;
