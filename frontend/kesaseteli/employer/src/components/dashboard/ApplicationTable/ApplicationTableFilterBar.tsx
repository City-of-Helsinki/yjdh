import { Select, ToggleButton, Tooltip } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { OptionType } from 'shared/types/common';
import styled, { DefaultTheme } from 'styled-components';

import { useApplicationTable } from './ApplicationTableContext';

const $FilterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};

  @media (max-width: ${(props: { theme: DefaultTheme }) =>
      props.theme.breakpoints.s}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const $SelectWrapper = styled.div`
  width: auto;
  text-align: left;

  & > div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};

    & > label {
      margin-bottom: 0;
      white-space: nowrap;
    }
  }

  @media (max-width: ${(props: { theme: DefaultTheme }) =>
      props.theme.breakpoints.s}) {
    width: 100%;
    & > div {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

const ApplicationTableFilterBar: React.FC = () => {
  const { t } = useTranslation();

  const {
    showOnlyMine,
    onToggleOnlyMine: onToggle,
    selectedYear,
    onChangeYear,
    availableYears,
  } = useApplicationTable();

  const options = React.useMemo<OptionType[]>(() => {
    const yearOptions = availableYears.map((year) => ({
      label: year,
      value: year,
    }));
    return [
      { label: t('common:dashboard.filterBar.yearFilterAll'), value: 'all' },
      ...yearOptions,
    ];
  }, [availableYears, t]);

  const selectedOption = options.find((opt) => opt.value === selectedYear);

  return (
    <$FilterBar>
      <$SelectWrapper>
        <Select
          id="application-table-filter-year"
          texts={{
            label: t('common:dashboard.filterBar.yearFilterLabel'),
          }}
          options={options}
          value={selectedOption ? [selectedOption] : []}
          onChange={(selectedOptions: OptionType[]) => {
            if (selectedOptions[0]) {
              onChangeYear(selectedOptions[0].value?.toString());
            }
          }}
        />
      </$SelectWrapper>
      <ToggleButton
        id="application-table-filter-mine"
        label={t('common:dashboard.filterBar.label')}
        aria-label={t('common:dashboard.filterBar.ariaLabel')}
        variant="inline"
        checked={showOnlyMine}
        onChange={onToggle}
        tooltip={
          <Tooltip
            id="application-table-filter-mine-tooltip"
            label={t('common:dashboard.filterBar.tooltipLabel')}
            buttonLabel={t('common:dashboard.filterBar.tooltipButtonLabel')}
          >
            {t('common:dashboard.filterBar.tooltipText')}
          </Tooltip>
        }
      />
    </$FilterBar>
  );
};

export default ApplicationTableFilterBar;
