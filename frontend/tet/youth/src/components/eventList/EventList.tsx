import React from 'react';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { LinkedEventsPagedResponse, LocalizedObject, TetEvent } from 'tet/admin/types/linkedevents';
import { useRouter } from 'next/router';
import JobPostingCard from 'tet/youth/components/eventList/JobPostingCard/JobPostingCard';
import { useTranslation } from 'next-i18next';
import { Button } from 'hds-react';
import { eventToTetPosting } from 'tet/admin/backend-api/transformations';

const getLocalizedString = (obj: LocalizedObject): string => obj.fi;

const EventList: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, data, error } = useQuery<LinkedEventsPagedResponse<TetEvent>>(BackendEndpoint.EVENT);
  const router = useRouter();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error) {
    return <div>Virhe datan latauksessa</div>;
  }

  if (data) {
    const postings = data.data.map((posting) => eventToTetPosting(posting));

    return (
      <div>
        <h2>{data.meta.count} hakutulosta</h2>
        {data && postings.map((e) => <JobPostingCard key={e.id} jobPosting={e} />)}
        <Button>{t('common:postingsPage.showMore')}</Button>
      </div>
    );
  } else {
    return <div>Ei tet-paikkoja</div>;
  }
};

export default EventList;
