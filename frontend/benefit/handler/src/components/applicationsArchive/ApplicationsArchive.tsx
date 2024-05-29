import useSearchApplicationQuery from 'benefit/handler/hooks/useSearchApplicationQuery';
import { SearchInput } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';

import { $EmptyHeading } from '../applicationList/ApplicationList.sc';
import ApplicationArchiveList from './ApplicationArchiveList';
import { $Heading } from './ApplicationsArchive.sc';
import ArchiveLoading from './ArchiveLoading';
import { useApplicationsArchive } from './useApplicationsArchive';

const ApplicationsArchive: React.FC = () => {
  const { t, shouldShowSkeleton, shouldHideList, translationsBase } =
    useApplicationsArchive();

  const [searchString, setSearchString] = React.useState<string>('');
  const [submittedSearchString, setSubmittedSearchString] =
    React.useState<string>('');

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    mutate,
  } = useSearchApplicationQuery(searchString, true);

  const onSearch = (value: string): void => {
    setSubmittedSearchString(value);
    setSearchString(value);
    mutate(value);
  };

  if (shouldShowSkeleton) {
    return <ArchiveLoading />;
  }

  return (
    <Container data-testid="application-list-archived">
      <$Heading as="h1" data-testid="main-ingress">{`${t(
        'common:header.navigation.archive'
      )}`}</$Heading>
      <>
        <div style={{ maxWidth: 630 }}>
          <SearchInput
            // tooltipText="Voit tarkentaa hakua työllistettävän nimellä lisäämällä kentän loppuun nimi:etunimi jokunimi sukunimi"
            helperText={t('common:search.input.keyword.helperText')}
            label={t('common:search.input.keyword.label')}
            placeholder={t('common:search.input.keyword.placeholder')}
            onChange={(e) => setSearchString(e)}
            onSubmit={(e) => onSearch(e)}
            css="margin-bottom: var(--spacing-m);"
          />
        </div>

        <ApplicationArchiveList
          data={searchResults?.matches}
          searchString={searchString}
          submittedSearchString={submittedSearchString}
          isSearchLoading={isSearchLoading}
        />
      </>

      {shouldHideList && !submittedSearchString && (
        <$EmptyHeading>
          {t(`${translationsBase}.messages.empty.archived`)}
        </$EmptyHeading>
      )}
    </Container>
  );
};

export default ApplicationsArchive;
