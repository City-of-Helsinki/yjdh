import {
  APPLICATION_STATUSES,
  INSTALMENT_STATUSES,
  TALPA_STATUSES,
} from 'benefit-shared/constants';
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

    case APPLICATION_STATUSES.ARCHIVAL:
      background = theme.colors.info;
      text = theme.colors.white;

      break;

    default:
      background = theme.colors.black40;
      break;
  }
  return { background, text };
};

export const getInstalmentTagStyleForStatus = (
  status?: INSTALMENT_STATUSES
): { background: string; text: string } => {
  let background: string;
  let text: string = theme.colors.black;
  switch (status) {
    case INSTALMENT_STATUSES.WAITING:
      background = theme.colors.black30;
      text = theme.colors.white;
      break;

    case INSTALMENT_STATUSES.ACCEPTED:
      background = theme.colors.tramLight;
      break;

    case INSTALMENT_STATUSES.CANCELLED:
      background = theme.colors.summer;
      break;

    case INSTALMENT_STATUSES.PAID:
      background = theme.colors.tram;
      text = theme.colors.white;
      break;

    case INSTALMENT_STATUSES.ERROR_IN_TALPA:
      background = theme.colors.error;
      text = theme.colors.white;
      break;

    case INSTALMENT_STATUSES.COMPLETED:
      background = theme.colors.success;
      text = theme.colors.white;
      break;

    default:
      background = theme.colors.black40;
      break;
  }
  return { background, text };
};

export const getTalpaTagStyleForStatus = (
  status?: TALPA_STATUSES
): { background: string; text: string } => {
  let background: string;
  let text: string = theme.colors.black;
  switch (status) {
    case TALPA_STATUSES.NOT_SENT_TO_TALPA:
      background = theme.colors.black30;
      text = theme.colors.white;
      break;

    case TALPA_STATUSES.REJECTED_BY_TALPA:
      background = theme.colors.error;
      text = theme.colors.white;
      break;

    case TALPA_STATUSES.SUCCESFULLY_SENT_TO_TALPA:
    case TALPA_STATUSES.PARTIALLY_SENT_TO_TALPA:
      background = theme.colors.success;
      text = theme.colors.white;
      break;

    default:
      background = theme.colors.black40;
      break;
  }
  return { background, text };
};
