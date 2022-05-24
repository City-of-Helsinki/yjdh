import React, { Fragment, useMemo, memo } from 'react';
import { LoadingSpinner, IconMap, IconLayers } from 'hds-react';
import JobPostingCard from 'tet/youth/components/jobPostingCard/JobPostingCard';
import { useTranslation } from 'next-i18next';
import Container from 'shared/components/container/Container';
import { Button } from 'hds-react';
import { $ButtonLoaderContainer, $MapButtonWrapper } from './JobPostingList.sc';
import { TetEvent, LinkedEventsPagedResponse } from 'tet-shared/types/linkedevents';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';
import TetPosting from 'tet-shared/types/tetposting';
import dynamic from 'next/dynamic';
import { useQuery, UseQueryResult } from 'react-query';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';

const Map = dynamic(() => import('tet-shared/components/map/Map'), { ssr: false });

type Props = {
  firstPostingsPage: LinkedEventsPagedResponse<TetEvent>;
  hasNextPage?: Boolean;
  allPostings: UseQueryResult<LinkedEventsPagedResponse<TetEvent>>;
  initMap: Boolean;
};

const JobPostingList: React.FC<Props> = ({ firstPostingsPage, hasNextPage, allPostings, initMap }) => {
  const { t } = useTranslation();
  const { eventToTetPosting } = useEventPostingTransformation();
  const eventsToPostings = (events: TetEvent[]) => events.map((event) => eventToTetPosting(event));
  const total = firstPostingsPage?.meta.count;
  const [showMap, setShowMap] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  const firstPagePostingsList = useMemo(() => {
    return eventsToPostings(firstPostingsPage.data);
  }, [firstPostingsPage]);
  const allPostingsList = useMemo(() => {
    return allPostings.isLoading || allPostings.error ? [] : eventsToPostings(allPostings.data.data);
  }, [allPostings]);
  const lastShown = currentPage * 10 <= total - 1 ? currentPage * 10 : total;

  const usedList = allPostings.isSuccess ? allPostingsList : firstPagePostingsList;
  console.log(lastShown, total, 'vertaus');

  const shownPostings = (): TetPosting[] => {
    return usedList.slice(0, lastShown);
  };

  const onShowMore = (): void => {
    setCurrentPage((prevState) => prevState + 1);
  };

  const MapContainer = allPostings.isLoading ? (
    <PageLoadingSpinner />
  ) : (
    <Map height={'1000px'} postings={allPostingsList} showLink={true} />
  );
  console.log(usedList);
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
      {showMap || initMap ? (
        MapContainer
      ) : (
        <Fragment>
          {shownPostings().map((posting) => (
            <JobPostingCard jobPosting={posting} />
          ))}
        </Fragment>
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
