import { OptionType } from 'tet-shared/types/classification';
import { IdObject } from 'tet/youth/linkedevents';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';

type Keyword = IdObject & {
  name: {
    fi: string;
  };
};

export const linkedEventsUrl =
  process.env.NEXT_PUBLIC_LINKEDEVENTS_URL || 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/';

export const BackendEndpoint = {
  EVENT: 'event/?include=location,keywords&page_size=10&sort=-name',
  PLACE: 'place/',
  KEYWORD: 'keyword/',
} as const;

export const singleEvent = (id: string) => {
  return `event/${id}?include=location,keywords`;
};
export const keywordToOptionType = (keyword: Keyword): OptionType => ({
  label: keyword.name.fi,
  name: keyword.name.fi,
  value: keyword.id,
});

export const BackendEndPoints = Object.values(BackendEndpoint);

export const createAxios = (): AxiosInstance =>
  Axios.create({
    baseURL: linkedEventsUrl,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

export const handleResponse = async <R>(axiosPromise: Promise<AxiosResponse<R>>): Promise<R> => {
  const { data } = await axiosPromise;
  return data;
};
