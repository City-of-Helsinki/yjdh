import { Select } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { OptionType } from 'shared/types/common';
import styled from 'styled-components';

import { ApplicationStatus } from '../../../types/application';

const $Wrapper = styled.div`
  margin-bottom: 1rem;
`;

type StatusFilterProps = {
  id: string;
  statuses: ApplicationStatus[];
  defaultSelectedStatuses?: ApplicationStatus[];
  onChange: (statuses: ApplicationStatus[]) => void;
};

type UseStatusFilterProps = {
  defaultSelectedStatuses?: ApplicationStatus[];
  statuses: ApplicationStatus[];
};

export const useStatusFilter = ({
  defaultSelectedStatuses,
  statuses,
}: UseStatusFilterProps): {
  selectedStatuses: ApplicationStatus[];
  setSelectedStatuses: React.Dispatch<
    React.SetStateAction<ApplicationStatus[]>
  >;
} => {
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>(
    defaultSelectedStatuses ?? statuses
  );

  useEffect(() => {
    if (defaultSelectedStatuses) {
      setSelectedStatuses(defaultSelectedStatuses);
    }
  }, [defaultSelectedStatuses]);

  return { selectedStatuses, setSelectedStatuses };
};

const StatusFilter = ({
  id,
  statuses,
  defaultSelectedStatuses,
  onChange,
}: StatusFilterProps): JSX.Element => {
  const { t } = useTranslation();
  const { selectedStatuses, setSelectedStatuses } = useStatusFilter({
    defaultSelectedStatuses,
    statuses,
  });

  const options = useMemo<OptionType<ApplicationStatus>[]>(
    () =>
      statuses.map((status) => ({
        label: t(`common:applicationList.status.${status}`),
        value: status,
      })),
    [statuses, t]
  );

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedStatuses.includes(option.value)),
    [options, selectedStatuses]
  );

  return (
    <$Wrapper>
      <Select
        id={id}
        multiSelect
        texts={{
          label: t('common:applicationList.columns.status'),
        }}
        options={options}
        value={selectedOptions}
        invalid={selectedStatuses.length === 0}
        onChange={(nextSelectedOptions: OptionType<ApplicationStatus>[]) => {
          const nextStatuses = nextSelectedOptions.map(
            (option) => option.value
          );
          setSelectedStatuses(nextStatuses);
          onChange(nextStatuses);
        }}
      />
    </$Wrapper>
  );
};

export default StatusFilter;
