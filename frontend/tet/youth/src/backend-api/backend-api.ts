import Axios, { AxiosInstance, AxiosResponse } from 'axios';

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
