import { ApplicationData } from 'benefit-shared/types/application';

export interface SearchResponse {
  q: string;
  matches: ApplicationData[];
  filter: string;
  search_mode: string;
  count: number;
}
