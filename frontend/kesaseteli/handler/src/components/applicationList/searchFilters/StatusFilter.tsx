import { Select } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import FieldErrorMessage from 'shared/components/forms/fields/fieldErrorMessage/FieldErrorMessage';
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
  // The status filter is invalid when no options are selected
  const isInvalid = selectedStatuses.length === 0;

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
        invalid={isInvalid}
        onChange={(nextSelectedOptions: OptionType<ApplicationStatus>[]) => {
          const nextStatuses = nextSelectedOptions.map(
            (option) => option.value
          );
          setSelectedStatuses(nextStatuses);
          // Only update query if selection is valid (not empty) to avoid querying every status
          if (nextStatuses.length > 0) {
            onChange(nextStatuses);
          }
        }}
      />
      {isInvalid && (
        <FieldErrorMessage data-testid={`${id}-error`}>
          {t('common:applicationList.filterError')}
        </FieldErrorMessage>
      )}
    </$Wrapper>
  );
};

export default StatusFilter;
