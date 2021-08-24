import { LoadingSpinner } from 'hds-react';
import React from 'react';
import theme from 'shared/styles/theme';

import { $SpinnerContainer } from './PageLoadingSpinner.sc';

const PageLoadingSpinner = (): JSX.Element => (
  <$SpinnerContainer backgroundColor={theme.colors.silverLight}>
    <LoadingSpinner />
  </$SpinnerContainer>
);

export default PageLoadingSpinner;
