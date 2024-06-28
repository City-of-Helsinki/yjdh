import { RadioButton, SearchInput, SelectionGroup } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';

import ApplicationArchiveList from './ApplicationArchiveList';
import { $Heading } from './ApplicationsArchive.sc';
import {
  DECISION_RANGE,
  FILTER_SELECTION,
  SUBSIDY_IN_EFFECT,
  useApplicationsArchive,
} from './useApplicationsArchive';

const ApplicationsArchive: React.FC = () => {
  const [searchString, setSearchString] = React.useState<string>('');

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

  const { t, isSearchLoading, searchResults, submitSearch } =
    useApplicationsArchive(
      searchString,
      true,
      true,
      subsidyInEffect,
      decisionRange
    );

  const onSearch = (value: string): void => {
    setSearchString(value);
    submitSearch(value);
  };

  React.useEffect(() => {
    submitSearch(searchString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSelection]);

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

  return (
    <Container data-testid="application-list-archived">
      <$Heading as="h1" data-testid="main-ingress">{`${t(
        'common:header.navigation.archive'
      )}`}</$Heading>
      <>
        <div style={{ maxWidth: 630 }}>
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
        </div>

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
