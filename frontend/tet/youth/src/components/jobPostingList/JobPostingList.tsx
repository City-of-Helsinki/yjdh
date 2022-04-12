import React, { Fragment } from 'react';
import { LoadingSpinner } from 'hds-react';
import JobPostingCard from 'tet/youth/components/jobPostingCard/JobPostingCard';
import { useTranslation } from 'next-i18next';
import Container from 'shared/components/container/Container';
import { Button } from 'hds-react';
import { $ButtonLoaderContainer } from './JobPostingList.sc';
import { TetEvent, LinkedEventsPagedResponse } from 'tet-shared/types/linkedevents';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('tet-shared/components/map/Map'), { ssr: false });

type Props = {
  postings: LinkedEventsPagedResponse<TetEvent>;
  onShowMore: () => void;
  hasNextPage?: Boolean;
};

const JobPostingList: React.FC<Props> = ({ postings, onShowMore, hasNextPage }) => {
  const { t } = useTranslation();
  const { eventToTetPosting } = useEventPostingTransformation();
  const eventsToPostings = (events: TetEvent[]) => events.map((event) => eventToTetPosting(event));
  const total = postings?.meta.count;
  const [showMap, setShowMap] = React.useState(false);

  return (
    <Container>
      {showMap ? (
        <Button onClick={() => setShowMap(false)}>Näytä lista</Button>
      ) : (
        <Button onClick={() => setShowMap(true)}>Näytä kartta</Button>
      )}
      <h2>{t('common:postings.searchResults', { count: total })}</h2>
      {showMap ? (
        <Map height={'1000px'} postings={eventsToPostings(postings.data)} />
      ) : (
        <Fragment>
          {eventsToPostings(postings.data).map((posting) => (
            <JobPostingCard jobPosting={posting} />
          ))}
        </Fragment>
      )}
      {hasNextPage && !showMap && (
        <$ButtonLoaderContainer>
          <Button onClick={onShowMore}>{t('common:postings.showMore')}</Button>
        </$ButtonLoaderContainer>
      )}
    </Container>
  );
};

export default JobPostingList;
