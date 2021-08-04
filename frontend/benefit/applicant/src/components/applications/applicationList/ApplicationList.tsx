import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import { $Heading, $ListWrapper } from './ApplicationList.sc';
import ListItem from './listItem/ListItem';
import useApplicationList from './useApplicationList';

export interface ApplicationListProps {
  heading: string;
  status: string[];
}

const ApplicationsList: React.FC<ApplicationListProps> = ({
  heading,
  status,
}) => {
  const { list, shouldShowSkeleton, shouldHideList } = useApplicationList(
    status
  );

  const items = shouldShowSkeleton ? (
    <ListItem isLoading />
  ) : (
    list?.map((props) => <ListItem key={props.id} {...props} />)
  );

  if (shouldHideList) return null;

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <$Heading>
        {shouldShowSkeleton ? <LoadingSkeleton width="20%" /> : heading}
      </$Heading>
      <$ListWrapper>{items}</$ListWrapper>
    </Container>
  );
};

export default ApplicationsList;
