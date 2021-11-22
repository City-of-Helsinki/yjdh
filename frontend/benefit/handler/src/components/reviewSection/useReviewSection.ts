import React from 'react';
import { DefaultTheme, useTheme } from 'styled-components';

import { ColorValue } from './ReviewSection.sc';

type ExtendedComponentProps = {
  theme: DefaultTheme;
  bgColor: ColorValue;
  withAction: boolean;
};

const useReviewSection = (
  action?: React.ReactNode,
  withMargin?: boolean
): ExtendedComponentProps => {
  const theme = useTheme();

  const bgColor = React.useMemo((): ColorValue => {
    if (action) {
      return theme.colors.silverLight;
    }
    if (withMargin) {
      return theme.colors.fogLight;
    }
    return theme.colors.white;
  }, [theme, action, withMargin]);

  return {
    theme,
    bgColor,
    withAction: Boolean(action || withMargin),
  };
};

export { useReviewSection };
