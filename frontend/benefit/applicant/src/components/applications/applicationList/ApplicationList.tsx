import { IconSpeechbubbleText } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';

import {
  $Heading,
  $ListInfo,
  $ListInfoInner,
  $ListInfoText,
  $ListWrapper,
} from './ApplicationList.sc';
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
  const { t } = useTranslation();
  const { list, shouldShowSkeleton, shouldHideList, newMessagesCount } =
    useApplicationList(status);

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
      {newMessagesCount > 0 && (
        <$ListInfo>
          <$GridCell $colStart={2}>
            <$ListInfoInner>
              <IconSpeechbubbleText />
              <$ListInfoText>
                {t('common:applications.list.common.newMessages', {
                  count: newMessagesCount,
                })}
              </$ListInfoText>
            </$ListInfoInner>
          </$GridCell>
        </$ListInfo>
      )}
    </Container>
  );
};

export default ApplicationsList;
