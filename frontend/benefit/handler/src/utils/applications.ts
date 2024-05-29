import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import theme from 'shared/styles/theme';

export const getTagStyleForStatus = (
  status: APPLICATION_STATUSES
): { background: string; text: string } => {
  let background: string;
  let text: string = theme.colors.black;
  switch (status) {
    case APPLICATION_STATUSES.DRAFT:
      background = theme.colors.black50;
      text = theme.colors.white;
      break;

    case APPLICATION_STATUSES.INFO_REQUIRED:
      background = theme.colors.alertLight;
      break;

    case APPLICATION_STATUSES.RECEIVED:
      background = theme.colors.black20;
      break;

    case APPLICATION_STATUSES.ACCEPTED:
      background = theme.colors.tramLight;
      break;

    case APPLICATION_STATUSES.REJECTED:
      background = theme.colors.brickMediumLight;
      break;

    case APPLICATION_STATUSES.CANCELLED:
      background = theme.colors.errorDark;
      text = theme.colors.white;
      break;

    case APPLICATION_STATUSES.HANDLING:
      background = theme.colors.infoLight;
      break;

    default:
      background = theme.colors.black40;
      break;
  }
  return { background, text };
};
