import { prettyPrintObject } from 'benefit-shared/utils/errors';

describe('errors utils', () => {
  it('pretty prints an error object', () => {
    expect(
      prettyPrintObject({
        data: {
          field: ['Required'],
          anotherField: ['Invalid value'],
        },
      })
    ).toBe('data: field: Required,anotherField: Invalid value');
  });

  it('returns an empty string when stringifying fails', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const stringifySpy = jest
      .spyOn(JSON, 'stringify')
      .mockImplementation(() => {
        throw new Error('boom');
      });

    expect(prettyPrintObject({ data: { field: ['Required'] } })).toBe('');
    expect(warnSpy).toHaveBeenCalledWith("Error: Can't print error object");

    stringifySpy.mockRestore();
    warnSpy.mockRestore();
  });
});