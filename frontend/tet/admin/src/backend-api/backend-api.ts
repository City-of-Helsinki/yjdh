import { ImageObject } from '@frontend/tet-shared/src/types/linkedevents';
import Axios from 'axios';

const axios = Axios.create({
  withCredentials: true,
  xsrfCookieName: 'yjdhcsrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export const BackendEndpoint = {
  TET_POSTINGS: '/v1/events/',
  LOGIN_ADFS: '/oauth2/login',
  LOGIN_OIDC: '/oidc/authenticate/',
  LOGOUT: '/logout/', // Backend redirects to correct logout endpoint based on login type
  USER: '/userinfo/',
  IMAGE: '/v1/images/',
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string => `${getBackendDomain()}${path}`;

export const uploadImage = async (image: File, photographerName: string): Promise<ImageObject> => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('photographer_name', photographerName);
  const response = await axios.post<ImageObject>(`${getBackendDomain()}${BackendEndpoint.IMAGE}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteImage = async (id: string): Promise<void> => {
  await axios.delete(`${getBackendDomain()}${BackendEndpoint.TET_POSTINGS}${id}/image/`);
};
