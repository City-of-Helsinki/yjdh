import React from 'react';
import { useQuery } from 'react-query';
import { TetPostings } from 'tet/admin/types/tetposting';
import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { LinkedEventsPagedResponse, TetEvent } from 'tet/youth/linkedevents';

const EventList: React.FC = () => {
  const { isLoading, data } = useQuery<LinkedEventsPagedResponse<TetEvent>>(BackendEndpoint.EVENT);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  console.log(data);

  return <div>EventList</div>;
};

export default EventList;
