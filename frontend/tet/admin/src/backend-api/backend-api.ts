import { ImageObject } from 'tet-shared/types/linkedevents';

export const BackendEndpoint = {
  TET_POSTINGS: '/v1/events/',
  LOGIN: '/oauth2/login',
  LOGOUT: '/oauth2/logout',
  USER: '/userinfo/',
  IMAGE: '/v1/images/',
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string => `${getBackendDomain()}${path}`;

export const uploadImage = async (image?: File): Promise<ImageObject> => {
  try {
    //Use when backend finishes
    //const response = await axios.post()
    //return response.data
    await new Promise((r) => setTimeout(r, 2000));
    return {
      url: 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/media/images/testimage_9gcuSik.png',
      '@id': 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/image/4234/',
    };
  } catch (err) {
    throw err;
  }
};
