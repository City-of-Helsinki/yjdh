import { ToggleButton } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';

const $FilterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${(props) => props.theme.spacing.s};
  margin-bottom: ${(props) => props.theme.spacing.s};
`;

type Props = {
  showOnlyMine: boolean;
  onToggle: () => void;
};

const DashboardFilterBar: React.FC<Props> = ({ showOnlyMine, onToggle }) => {
  const { t } = useTranslation();

  return (
    <$FilterBar>
      <ToggleButton
        id="application-table-filter-mine"
        label={t('common:dashboard.filterBar.label')}
        aria-label={t('common:dashboard.filterBar.ariaLabel')}
        variant="inline"
        checked={showOnlyMine}
        onChange={onToggle}
        tooltipLabel={t('common:dashboard.filterBar.tooltipLabel')}
        tooltipText={t('common:dashboard.filterBar.tooltipText')}
        tooltipButtonLabel={t('common:dashboard.filterBar.tooltipButtonLabel')}
      />
    </$FilterBar>
  );
};

export default DashboardFilterBar;
