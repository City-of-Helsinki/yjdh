import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { DefaultTheme } from 'styled-components';

export const statusColorMap = (
  status: APPLICATION_STATUSES
): keyof DefaultTheme['colors'] => {
  const variant = 'MediumLight';
  switch (status) {
    case APPLICATION_STATUSES.HANDLING:
      return `coatOfArms${variant}`;

    case APPLICATION_STATUSES.INFO_REQUIRED:
      return `summer${variant}`;

    case APPLICATION_STATUSES.ACCEPTED:
      return `tram${variant}`;

    case APPLICATION_STATUSES.REJECTED:
      return `brick${variant}`;

    default:
      return `coatOfArms${variant}`;
  }
};
