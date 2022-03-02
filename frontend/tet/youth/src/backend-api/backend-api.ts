import { OptionType } from 'tet/admin/types/classification';
import { IdObject } from 'tet/youth/linkedevents';
type Keyword = IdObject & {
  name: {
    fi: string;
  };
};

export const linkedEventsUrl =
  process.env.NEXT_PUBLIC_LINKEDEVENTS_URL || 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/';

export const BackendEndpoint = {
  EVENT: 'event/?sort=-name',
  PLACE: 'place/',
  KEYWORD: 'keyword/',
} as const;

export const keywordToOptionType = (keyword: Keyword): OptionType => ({
  label: keyword.name.fi,
  name: keyword.name.fi,
  value: keyword.id,
});

export const BackendEndPoints = Object.values(BackendEndpoint);
