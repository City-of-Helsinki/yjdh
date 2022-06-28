import { fakeTetPosting } from 'tet-shared/__tests__/utils/fake-objects';
import {
  hdsDateToIsoFormat,
  isoDateToHdsFormat,
  tetPostingToEvent,
} from 'tet-shared/backend-api/transformations';
import { OptionType } from 'tet-shared/types/classification';

const optionTypeForId = (id: string): OptionType => ({
  name: 'not needed by test',
  label: 'not needed by test',
  value: `http://localhost/keyword/${id}/`,
});

describe('transformations', () => {
  it('can transform HDS date into ISO format', () => {
    expect(hdsDateToIsoFormat('4.5.2022')).toBe('2022-05-04');
    expect(hdsDateToIsoFormat('10.12.2022')).toBe('2022-12-10');
  });

  it('can transform ISO date into HDS format', () => {
    expect(isoDateToHdsFormat('2022-12-10')).toBe('10.12.2022');
    expect(isoDateToHdsFormat('2022-05-04')).toBe('4.5.2022');
  });

  it('can transform draft posting to event', () => {
    const posting = fakeTetPosting({
      keywords: [
        optionTypeForId('yso:1'),
        optionTypeForId('yso:2'),
        optionTypeForId('yso:3'),
      ],
      keywords_working_methods: [optionTypeForId('tet:1')],
      keywords_attributes: [
        optionTypeForId('yso:4'),
        optionTypeForId('yso:5'),
        optionTypeForId('yso:6'),
      ],
    });

    const event = tetPostingToEvent({ posting });

    expect(event.date_published).toBeNull();
    expect(event.publication_status).toBeUndefined();

    expect(event.name).toStrictEqual({ fi: posting.title });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(event.location).toStrictEqual({ '@id': posting.location.value });
    expect(event.description).toStrictEqual({ fi: posting.description });

    // Function `tetPostingToEvent` places the classifications in this order inside `keywords`.
    // Changing the order would break no functionality but it would break this test.
    expect(event.keywords).toStrictEqual(
      [
        ...posting.keywords_working_methods,
        ...posting.keywords_attributes,
        ...posting.keywords,
      ].map((o) => ({
        '@id': o.value,
      }))
    );

    expect(event.custom_data).toStrictEqual({
      spots: posting.spots.toString(),
      org_name: posting.org_name,
      contact_email: posting.contact_email,
      contact_phone: posting.contact_phone,
      contact_first_name: posting.contact_first_name,
      contact_last_name: posting.contact_last_name,
      website_url: '',
    });

    expect(event.start_time).toBe(posting.start_date);
    expect(event.end_time).toBeNull();

    expect(event.in_language).toStrictEqual(
      posting.languages.map((l) => ({
        '@id': `http://localhost:8080/v1/language/${l.value}/`,
      }))
    );
  });

  it('can transform draft posting to a published event', () => {
    const posting = fakeTetPosting();
    const event = tetPostingToEvent({ posting, publish: true });

    const currentTimeISO = new Date().toISOString();

    expect(event.publication_status).toBe('public');
    expect(event.date_published.slice(0, 10)).toBe(currentTimeISO.slice(0, 10));
  });

  it('published event keeps its date_published', () => {
    const datePublished = '2022-03-22';
    const posting = fakeTetPosting({ date_published: datePublished });
    const event = tetPostingToEvent({ posting });

    expect(event.date_published).toBe(datePublished);

    // This might seem counter-intuitive that published posting doesn't have the `publication_status` set
    // but the reasoning is that when sending it this way, the backend removes it from the PUT request
    // to LinkedEvents, which leaves event's publication_status unchanged.
    expect(event.publication_status).toBeUndefined();
  });
});
