import { ApplicationData } from 'benefit/applicant/types/application';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import SC from './ApplicationList.sc';
import ListItem from './listItem/ListItem';
import useApplicationList from './useApplicationList';

export interface ApplicationListProps {
  heading: string;
  data: ApplicationData[];
  isLoading: boolean;
}

const ApplicationsList: React.FC<ApplicationListProps> = ({
  heading,
  data,
  isLoading,
}) => {
  const { list, shouldShowSkeleton, shouldHideList } = useApplicationList({
    data,
    isLoading,
  });

  const items = shouldShowSkeleton ? (
    <ListItem isLoading />
  ) : (
    list?.map((props) => <ListItem key={props.id} {...props} />)
  );

  if (shouldHideList) return null;

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <SC.Heading>
        {shouldShowSkeleton ? <LoadingSkeleton width="20%" /> : heading}
      </SC.Heading>
      <SC.ListWrapper>{items}</SC.ListWrapper>
    </Container>
  );
};

export default ApplicationsList;
