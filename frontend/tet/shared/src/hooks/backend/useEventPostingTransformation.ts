import useLocale from 'shared/hooks/useLocale';
import { isoDateToHdsFormat } from 'tet-shared/backend-api/transformations';
import useKeywordType, {
  UseKeywordResult,
} from 'tet-shared/hooks/backend/useKeywordType';
import useLanguageOptions from 'tet-shared/hooks/translation/useLanguageOptions';
import { OptionType } from 'tet-shared/types/classification';
import { ClassificationType, KeywordFn } from 'tet-shared/types/keywords';
import {
  IdObject,
  LocalizedObject,
  TetEvent,
  TetEvents,
} from 'tet-shared/types/linkedevents';
import TetPosting, { TetPostings } from 'tet-shared/types/tetposting';

type Transformations = {
  eventToTetPosting: (
    event: TetEvent,
    keywordType?: KeywordFn,
    languageOptions?: OptionType[]
  ) => TetPosting;
  eventsToTetPostings: (events: TetEvents | undefined) => TetPostings;
  keywordResult: UseKeywordResult;
  getLocalizedString: (obj: LocalizedObject | undefined) => string;
};

type ImageFields = {
  image_url: string;
  image_id: string;
  photographer_name: string;
}

const useEventPostingTransformation = (): Transformations => {
  const locale = useLocale();
  const keywordResult = useKeywordType();
  const languageOptions = useLanguageOptions();

  const keywordType = keywordResult.getKeywordType;

  const getLocalizedString = (obj: LocalizedObject | undefined): string => {
    if (obj) {
      return obj[locale] ?? obj.fi;
    }
    return '';
  };

  const keywordToOptionType = (keyword: IdObject): OptionType => ({
    name: getLocalizedString(keyword.name),
    label: getLocalizedString(keyword.name),
    value: keyword['@id'],
  });
  /**
   * Convert event read from Linked Events API to form data.
   *
   * @param event
   */
   // eslint-disable-next-line sonarjs/cognitive-complexity
   const eventToTetPosting = (event: TetEvent): TetPosting => {
    const parsedSpots = parseInt(event.custom_data?.spots || '', 10);
    const spots = parsedSpots >= 0 ? parsedSpots : 1;

    const imageFields: ImageFields | null = (event.images && event.images.length > 0) ?
    {
      image_url: event.images[0].url,
      image_id: event.images[0]['@id'],
      photographer_name: event.images[0].photographer_name,
    } : null;

    return {
      id: event.id,
      title: getLocalizedString(event.name),
      description: getLocalizedString(event.description),
      org_name: event.custom_data?.org_name || '',
      // note that with GET /event/ all but @id are empty
      location: {
        name: getLocalizedString(event.location.name),
        label: getLocalizedString(event.location.name),
        value: event.location['@id'],
        street_address: getLocalizedString(event.location.street_address),
        city: getLocalizedString(event.location.address_locality),
        postal_code: event.location.postal_code ?? '',
        position: event.location.position,
      },
      start_date: isoDateToHdsFormat(event.start_time) ?? '',
      end_date: isoDateToHdsFormat(event.end_time),
      date_published: event.date_published,
      contact_email: event.custom_data?.contact_email || '',
      contact_first_name: event.custom_data?.contact_first_name || '',
      contact_last_name: event.custom_data?.contact_last_name || '',
      contact_phone: event.custom_data?.contact_phone || '',
      keywords: keywordType
        ? event.keywords
            .filter(
              (keyword) =>
                keywordType(keyword['@id']) === ClassificationType.KEYWORD
            )
            // note that with GET /event/ all but @id are empty
            .map((keyword) => keywordToOptionType(keyword))
        : [],
      keywords_working_methods: keywordType
        ? event.keywords
            .filter(
              (keyword) =>
                keywordType(keyword['@id']) ===
                ClassificationType.WORKING_METHOD
            )
            .map((keyword) => keywordToOptionType(keyword))
        : [],
      keywords_attributes: keywordType
        ? event.keywords
            .filter(
              (keyword) =>
                keywordType(keyword['@id']) ===
                ClassificationType.WORKING_FEATURE
            )
            .map((keyword) => keywordToOptionType(keyword))
        : [],
      languages: languageOptions
        ? event.in_language.map((obj) => {
            const splits = obj['@id'].split('/');
            const lang = splits[splits.length - 2];
            return (
              languageOptions.find((option) => option.value === lang) || {
                name: '',
                value: lang,
                label: '',
              }
            );
          })
        : [],
      website_url: event.custom_data.website_url,
      spots,
      ...imageFields,
    };
  };

  const eventsToTetPostings = (events: TetEvents | undefined): TetPostings => {
    const postings: TetPostings = {
      draft: [],
      published: [],
    };

    if (!events) {
      return postings;
    }

    if (events.draft.length > 0) {
      postings.draft = events.draft.map((e) => eventToTetPosting(e));
    }

    if (events.published.length > 0) {
      postings.published = events.published.map((e) => eventToTetPosting(e));
    }

    return postings;
  };

  return {
    eventToTetPosting,
    eventsToTetPostings,
    keywordResult,
    getLocalizedString,
  };
};

export default useEventPostingTransformation;
