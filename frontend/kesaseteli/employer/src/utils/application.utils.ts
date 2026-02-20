import Application from 'shared/types/application';

export const EMPLOYER_FIELDS: (keyof Application)[] = [
    'contact_person_name',
    'contact_person_email',
    'contact_person_phone_number',
    'street_address',
    'bank_account_number',
];

export const extractEmployerFields = (
    application: Partial<Application>
): Partial<Application> => {
    const result: Partial<Application> = {};
    EMPLOYER_FIELDS.forEach((field) => {
        if (application[field] !== undefined) {
            (result as Record<string, unknown>)[field] = application[field];
        }
    });
    return result;
};
