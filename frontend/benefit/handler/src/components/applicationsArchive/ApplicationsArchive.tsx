import { ROUTES } from 'benefit/handler/constants';
import {
  IconCross,
  RadioButton,
  SearchInput,
  SelectionGroup,
  StatusLabel,
} from 'hds-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

import ApplicationArchiveList from './ApplicationArchiveList';
import { $Heading } from './ApplicationsArchive.sc';
import {
  DECISION_RANGE,
  FILTER_SELECTION,
  SUBSIDY_IN_EFFECT,
  useApplicationsArchive,
} from './useApplicationsArchive';

const $SearchInputArea = styled.div`
  max-width: 630px;
  .custom-status-label {
    font-size: 18px;
    padding: 0.5em 1em;
    margin-bottom: 2em;
    display: flex;
    align-items: center;

    a {
      display: flex;
      align-items: center;
    }
  }
`;

const ApplicationsArchive: React.FC = () => {
  const [searchString, setSearchString] = React.useState<string>('');
  const [initialQuery, setInitialQuery] = React.useState<boolean>(true);
  const [subsidyInEffect, setSubsidyInEffect] =
    React.useState<SUBSIDY_IN_EFFECT | null>(
      SUBSIDY_IN_EFFECT.RANGE_THREE_YEARS
    );
  const [decisionRange, setDecisionRange] =
    React.useState<DECISION_RANGE | null>(null);
  const [filterSelection, setFilterSelection] =
    React.useState<FILTER_SELECTION>(
      FILTER_SELECTION.SUBSIDY_IN_EFFECT_RANGE_THREE_YEARS
    );

  const router = useRouter();
  const applicationNum = router?.query?.appNo || null;
  const { t, isSearchLoading, searchResults, submitSearch } =
    useApplicationsArchive(
      searchString,
      true,
      true,
      subsidyInEffect,
      decisionRange,
      applicationNum ? applicationNum.toString() : null
    );

  const onSearch = (value: string): void => {
    setSearchString(value);
    submitSearch(value);
  };

  const handleSubsidyFilterChange = (
    selection: FILTER_SELECTION,
    value?: SUBSIDY_IN_EFFECT
  ): void => {
    setFilterSelection(selection);
    setDecisionRange(null);
    setSubsidyInEffect(value);
  };
  const handleDecisionFilterChange = (
    selection: FILTER_SELECTION,
    value?: number
  ): void => {
    setFilterSelection(selection);
    setDecisionRange(value);
    setSubsidyInEffect(null);
  };
  const handleFiltersOff = (): void => {
    setDecisionRange(null);
    setSubsidyInEffect(null);
    setFilterSelection(FILTER_SELECTION.NO_FILTER);
  };

  React.useEffect(() => {
    if (!router || !router.isReady) return;
    if (applicationNum && initialQuery) {
      handleFiltersOff();
      setInitialQuery(false);
    } else if (!isSearchLoading) {
      submitSearch(searchString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSelection, applicationNum, router, initialQuery]);

  return (
    <Container data-testid="application-list-archived">
      <$Heading as="h1" data-testid="main-ingress">{`${t(
        'common:header.navigation.archive'
      )}`}</$Heading>
      <>
        <$SearchInputArea>
          {!applicationNum && (
            <SearchInput
              helperText={t(
                'common:search.fields.searchInput.keyword.helperText'
              )}
              label={t('common:search.fields.searchInput.keyword.label')}
              placeholder={t(
                'common:search.fields.searchInput.keyword.placeholder'
              )}
              onChange={(value) => setSearchString(value)}
              onSubmit={(value) => onSearch(value)}
              css="margin-bottom: var(--spacing-m);"
            />
          )}

          {applicationNum && (
            <div>
              <div
                style={{
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <StatusLabel className="custom-status-label">
                  <div>
                    Haetaan aiempia työsuhteita hakemuksen{' '}
                    <u>{applicationNum}</u> perusteella
                  </div>
                  <Link href={ROUTES.APPLICATIONS_ARCHIVE}>
                    <IconCross />
                  </Link>
                </StatusLabel>
              </div>
            </div>
          )}
        </$SearchInputArea>
        <$Grid>
          <$GridCell $colSpan={6}>
            <Heading
              as="h4"
              header={t('common:search.fields.filters.title')}
              $css={{ margin: 0 }}
            />

            <SelectionGroup disabled={isSearchLoading}>
              <RadioButton
                id="subsidy-past-three-years"
                label={t(
                  'common:search.fields.filters.subsidyInEffectThreeYears'
                )}
                checked={
                  filterSelection ===
                  FILTER_SELECTION.SUBSIDY_IN_EFFECT_RANGE_THREE_YEARS
                }
                onClick={() =>
                  handleSubsidyFilterChange(
                    FILTER_SELECTION.SUBSIDY_IN_EFFECT_RANGE_THREE_YEARS,
                    SUBSIDY_IN_EFFECT.RANGE_THREE_YEARS
                  )
                }
              />
              <RadioButton
                id="subsidy-in-effect"
                label={t('common:search.fields.filters.subsidyInEffectNow')}
                checked={
                  filterSelection === FILTER_SELECTION.SUBSIDY_IN_EFFECT_NOW
                }
                onClick={() =>
                  handleSubsidyFilterChange(
                    FILTER_SELECTION.SUBSIDY_IN_EFFECT_NOW,
                    SUBSIDY_IN_EFFECT.RANGE_NOW
                  )
                }
              />
              <RadioButton
                id="decision-range-three-years"
                label={t(
                  'common:search.fields.filters.decisionDateInThreeYears'
                )}
                checked={
                  filterSelection ===
                  FILTER_SELECTION.DECISION_RANGE_THREE_YEARS
                }
                onClick={() =>
                  handleDecisionFilterChange(
                    FILTER_SELECTION.DECISION_RANGE_THREE_YEARS,
                    DECISION_RANGE.RANGE_THREE_YEARS
                  )
                }
              />

              <RadioButton
                id="show-all"
                label={t('common:search.fields.filters.noFilter')}
                checked={filterSelection === FILTER_SELECTION.NO_FILTER}
                onClick={() => handleFiltersOff()}
              />
            </SelectionGroup>
          </$GridCell>
        </$Grid>
      </>

      <ApplicationArchiveList
        data={searchResults?.matches}
        isSearchLoading={isSearchLoading}
      />
    </Container>
  );
};

export default ApplicationsArchive;
