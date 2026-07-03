import { ROUTES } from 'kesaseteli-shared/constants/routes';
import NextLink from 'next/link';
import React from 'react';
import styled from 'styled-components';

import { ApplicationListType, BaseApplication } from '../../types/application';

const $Link = styled(NextLink)`
  cursor: pointer;
  text-decoration: underline;
`;

type ActionCellProps<R = BaseApplication> = {
  value: React.ReactNode;
  row: R;
  type: ApplicationListType;
};

const BASE_PATH_MAP: Record<ApplicationListType, string> = {
  youth: ROUTES.YOUTH_APPLICATIONS,
  employer: ROUTES.EMPLOYER_APPLICATIONS,
};

export default function ActionCell<R extends BaseApplication>({
  value,
  row,
  type,
}: ActionCellProps<R>): JSX.Element {
  const basePath = BASE_PATH_MAP[type];
  const link = `${basePath}/${String(row.id)}`;

  return (
    <$Link href={link}>
      {value}
    </$Link>
  );
}
