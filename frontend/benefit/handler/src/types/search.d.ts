import { ApplicationData } from 'benefit-shared/types/application';

export interface SearchData {
  q: string;
  matches: ApplicationData[];
  filter: string;
  search_mode: string;
  count: number;
}
