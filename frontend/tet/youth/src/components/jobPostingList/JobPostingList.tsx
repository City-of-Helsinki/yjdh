import { Button, IconLayers, IconMap } from 'hds-react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import React, { memo, useCallback, useMemo } from 'react';
import { UseQueryResult } from 'react-query';
import Container from 'shared/components/container/Container';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import JobPostingCard from 'tet/youth/components/jobPostingCard/JobPostingCard';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';
import { LinkedEventsPagedResponse, TetEvent } from 'tet-shared/types/linkedevents';
import TetPosting from 'tet-shared/types/tetposting';

import { $ButtonLoaderContainer, $MapButtonWrapper } from './JobPostingList.sc';

const Map = dynamic(() => import('tet-shared/components/map/Map'), { ssr: false });

type Props = {
  firstPostingsPage: LinkedEventsPagedResponse<TetEvent>;
  allPostings: UseQueryResult<LinkedEventsPagedResponse<TetEvent>>;
  initMap: boolean;
};

const JobPostingList: React.FC<Props> = ({ firstPostingsPage, allPostings, initMap }) => {
  const { t } = useTranslation();
  const { eventToTetPosting } = useEventPostingTransformation();
  const eventsToPostings = useCallback(
    (events: TetEvent[]): TetPosting[] => events.map((event) => eventToTetPosting(event)),
    [eventToTetPosting],
  );
  const total = firstPostingsPage?.meta.count;
  const [showMap, setShowMap] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setShowMap(initMap);
  }, [initMap]);

  const firstPagePostingsList = useMemo(
    () => eventsToPostings(firstPostingsPage.data),
    [eventsToPostings, firstPostingsPage.data],
  );
  const allPostingsList = useMemo(
    () => (allPostings.isLoading || allPostings.error ? [] : eventsToPostings(allPostings.data.data)),
    [allPostings.data.data, allPostings.error, allPostings.isLoading, eventsToPostings],
  );
  const lastShown = currentPage * 10 <= total - 1 ? currentPage * 10 : total;

  const usedList = allPostings.isSuccess ? allPostingsList : firstPagePostingsList;

  const shownPostings = (): TetPosting[] => usedList.slice(0, lastShown);

  const onShowMore = (): void => {
    setCurrentPage((prevState) => prevState + 1);
  };

  const MapContainer = allPostings.isLoading ? (
    <PageLoadingSpinner />
  ) : (
    <Map height="1000px" postings={allPostingsList} showLink />
  );
  return (
    <Container>
      <$MapButtonWrapper>
        {showMap ? (
          <Button iconRight={<IconLayers />} onClick={() => setShowMap(false)}>
            {t('common:map.showList')}
          </Button>
        ) : (
          <Button iconRight={<IconMap />} onClick={() => setShowMap(true)}>
            {t('common:map.showMap')}
          </Button>
        )}
      </$MapButtonWrapper>
      <h2>{t('common:postings.searchResults', { count: total })}</h2>
      {showMap ? (
        MapContainer
      ) : (
        <>
          {shownPostings().map((posting) => (
            <JobPostingCard jobPosting={posting} />
          ))}
        </>
      )}
      {lastShown !== total && !showMap && (
        <$ButtonLoaderContainer>
          <Button onClick={onShowMore} isLoading={allPostings.isLoading}>
            {t('common:postings.showMore')}
          </Button>
        </$ButtonLoaderContainer>
      )}
    </Container>
  );
};

export default memo(JobPostingList);
