import { Checkbox, RadioButton, SearchInput, SelectionGroup } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';

import ApplicationArchiveList from './ApplicationArchiveList';
import { $Heading } from './ApplicationsArchive.sc';
import { useApplicationsArchive } from './useApplicationsArchive';

export enum SUBSIDY_IN_EFFECT {
  RANGE_UNLIMITED = null,
  RANGE_THREE_YEARS = 3,
  RANGE_NOW = 1,
}

export enum DECISION_RANGE {
  RANGE_UNLIMITED = null,
  RANGE_THREE_YEARS = 3,
}

const ApplicationsArchive: React.FC = () => {
  const [searchString, setSearchString] = React.useState<string>('');

  const [includeArchivalApplications, setIncludeArchivalApplications] =
    React.useState<boolean>(false);
  const [subsidyInEffect, setSubsidyInEffect] =
    React.useState<SUBSIDY_IN_EFFECT>(SUBSIDY_IN_EFFECT.RANGE_THREE_YEARS);
  const [decisionRange, setDecisionRange] = React.useState<number>(
    DECISION_RANGE.RANGE_UNLIMITED
  );
  const [filterSelection, setFilterSelection] = React.useState<number>(1);

  const { t, isSearchLoading, searchResults, submitSearch } =
    useApplicationsArchive(
      searchString,
      true,
      includeArchivalApplications,
      subsidyInEffect,
      decisionRange
    );

  const onSearch = (value: string): void => {
    setSearchString(value);
    submitSearch(value);
  };

  const showArchivalApplications = (): void => {
    setIncludeArchivalApplications(!includeArchivalApplications);
    setSubsidyInEffect(SUBSIDY_IN_EFFECT.RANGE_UNLIMITED);
    setDecisionRange(DECISION_RANGE.RANGE_UNLIMITED);
  };

  const handleSubsidyFilterChange = (
    selection: number,
    value?: number
  ): void => {
    setFilterSelection(selection);
    setDecisionRange(DECISION_RANGE.RANGE_UNLIMITED);
    setSubsidyInEffect(value);
  };
  const handleDecisionFilterChange = (
    selection: number,
    value?: number
  ): void => {
    setFilterSelection(selection);
    setDecisionRange(value);
    setSubsidyInEffect(SUBSIDY_IN_EFFECT.RANGE_UNLIMITED);
  };
  const handleFiltersOff = (): void => {
    setDecisionRange(DECISION_RANGE.RANGE_UNLIMITED);
    setSubsidyInEffect(SUBSIDY_IN_EFFECT.RANGE_UNLIMITED);
    setFilterSelection(4);
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
            onChange={(e) => setSearchString(e)}
            onSubmit={(e) => onSearch(e)}
            css="margin-bottom: var(--spacing-m);"
          />
        </div>

        <$Grid>
          <$GridCell $colSpan={12}>
            <SelectionGroup>
              <Checkbox
                id="include-archival-applications"
                label="Näytä hyväksytyt vanhat hakemukset"
                checked={includeArchivalApplications}
                onClick={() => showArchivalApplications()}
              />
            </SelectionGroup>
          </$GridCell>
          <$GridCell $colSpan={6}>
            <Heading
              as="h4"
              header={t('common:search.fields.filters.title')}
              $css={{ margin: 0 }}
            />

            <SelectionGroup disabled={includeArchivalApplications}>
              <RadioButton
                id="subsidy-past-three-years"
                label={t(
                  'common:search.fields.filters.subsidyInEffectThreeYears'
                )}
                checked={filterSelection === 1}
                onClick={() =>
                  handleSubsidyFilterChange(
                    1,
                    SUBSIDY_IN_EFFECT.RANGE_THREE_YEARS
                  )
                }
              />
              <RadioButton
                id="subsidy-in-effect"
                label={t('common:search.fields.filters.subsidyInEffectNow')}
                checked={filterSelection === 2}
                onClick={() =>
                  handleSubsidyFilterChange(2, SUBSIDY_IN_EFFECT.RANGE_NOW)
                }
              />
              <RadioButton
                id="decision-range-three-years"
                label={t(
                  'common:search.fields.filters.decisionDateInThreeYears'
                )}
                checked={filterSelection === 3}
                onClick={() =>
                  handleDecisionFilterChange(
                    3,
                    DECISION_RANGE.RANGE_THREE_YEARS
                  )
                }
              />

              <RadioButton
                id="show-all"
                label={t('common:search.fields.filters.noFilter')}
                checked={filterSelection === 4}
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
