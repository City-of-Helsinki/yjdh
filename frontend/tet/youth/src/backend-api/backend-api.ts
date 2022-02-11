export const linkedEventsUrl =
  process.env.NEXT_PUBLIC_LINKEDEVENTS_URL || 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/';

export const BackendEndpoint = {
  EVENT: '/event/',
  PLACE: '/place/',
  KEYWORD: '/keyword/',
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);
