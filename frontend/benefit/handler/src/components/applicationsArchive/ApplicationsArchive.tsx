import { ROUTES } from 'benefit/handler/constants';
import {
  ButtonPresetTheme,
  IconCross,
  RadioButton,
  Search,
  SelectionGroup,
  StatusLabel,
} from 'hds-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import Button from 'shared/components/button/Button';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { focusAndScrollToSelector } from 'shared/utils/dom.utils';
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

const searchButtonAriaLabelKey =
  'common:search.fields.searchInput.keyword.searchButtonAriaLabel'; // eslint-disable-line no-secrets/no-secrets
const searchClearButtonAriaLabelKey =
  'common:search.fields.searchInput.keyword.searchClearButtonAriaLabel'; // eslint-disable-line no-secrets/no-secrets

const ITEMS_PER_PAGE = 30;

const ApplicationsArchive: React.FC = () => {
  const [searchString, setSearchString] = React.useState<string>('');
  const [initialQuery, setInitialQuery] = React.useState<boolean>(true);
  const [isLoadAllMode, setIsLoadAllMode] = React.useState<boolean>(false);
  const [displayLoadAll, setDisplayLoadAll] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

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
      applicationNum ? applicationNum.toString() : null,
      isLoadAllMode
    );
  const searchTexts = React.useMemo(
    () => ({
      assistive: t('common:search.fields.searchInput.keyword.helperText'),
      label: t('common:search.fields.searchInput.keyword.label'),
      placeholder: t('common:search.fields.searchInput.keyword.placeholder'),
      searchButtonAriaLabel: t(searchButtonAriaLabelKey),
      searchClearButtonAriaLabel: t(searchClearButtonAriaLabelKey),
    }),
    [t]
  );

  const onSearch = (value: string): void => {
    setSearchString(value);
    setIsLoadAllMode(false);
    setDisplayLoadAll(true);
    setCurrentPage(1);
    submitSearch(value, {
      limit: ITEMS_PER_PAGE,
      offset: 0,
    });
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    submitSearch(searchString, {
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    });
  };

  const handleSubsidyFilterChange = (
    selection: FILTER_SELECTION,
    value?: SUBSIDY_IN_EFFECT
  ): void => {
    setFilterSelection(selection);
    setDecisionRange(null);
    setSubsidyInEffect(value || null);
    setDisplayLoadAll(true);
    setIsLoadAllMode(false);
    setCurrentPage(1);
  };
  const handleDecisionFilterChange = (
    selection: FILTER_SELECTION,
    value?: number
  ): void => {
    setFilterSelection(selection);
    setDecisionRange(value || null);
    setSubsidyInEffect(null);
    setDisplayLoadAll(true);
    setIsLoadAllMode(false);
    setCurrentPage(1);
  };
  const handleFiltersOff = (): void => {
    setDecisionRange(null);
    setSubsidyInEffect(null);
    setFilterSelection(FILTER_SELECTION.NO_FILTER);
    setDisplayLoadAll(true);
    setIsLoadAllMode(false);
    setCurrentPage(1);
  };

  React.useEffect(() => {
    if (!router || !router.isReady) return;
    if (applicationNum && initialQuery) {
      handleFiltersOff();
      setInitialQuery(false);
    } else if (!isSearchLoading) {
      submitSearch(searchString, {
        limit: ITEMS_PER_PAGE,
        offset: 0,
      });
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSelection, applicationNum, router, initialQuery, isLoadAllMode]);

  const pageCount = Math.ceil((searchResults?.count ?? 0) / ITEMS_PER_PAGE);

  return (
    <Container data-testid="application-list-archived">
      <$Heading as="h1" data-testid="main-ingress">{`${t(
        'common:header.navigation.archive'
      )}`}</$Heading>
      <>
        <$SearchInputArea>
          {!applicationNum && (
            <Search
              texts={searchTexts}
              onChange={(value) => setSearchString(value.target.value)}
              onSend={(value) => onSearch(value)}
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
        data={searchResults?.matches || []}
        totalCount={searchResults?.count ?? 0}
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={handlePageChange}
        isSearchLoading={isSearchLoading}
      />
      {displayLoadAll &&
        !isSearchLoading &&
        searchString.length === 0 &&
        Boolean(searchResults?.next) && (
          <Button
            style={{ marginTop: 'var(--spacing-m)' }}
            theme={ButtonPresetTheme.Coat}
            onClick={() => {
              setIsLoadAllMode(true);
              setDisplayLoadAll(false);
              setCurrentPage(1);
              focusAndScrollToSelector('header');
            }}
          >
            {t('common:utility.loadMore')}
          </Button>
        )}
    </Container>
  );
};

export default ApplicationsArchive;
