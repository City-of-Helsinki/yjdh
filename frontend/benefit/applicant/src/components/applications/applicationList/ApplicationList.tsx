import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import ListItem from './listItem/ListItem';
import { StyledHeading, StyledListWrapper } from './styled';
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
      <StyledHeading>
        {shouldShowSkeleton ? <LoadingSkeleton width="20%" /> : heading}
      </StyledHeading>
      <StyledListWrapper>{items}</StyledListWrapper>
    </Container>
  );
};

export default ApplicationsList;
