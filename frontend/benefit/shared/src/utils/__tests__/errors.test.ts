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

  it('runs in linear time even for long whitespace-heavy input (no super-linear regex backtracking)', () => {
    // A field value with a long run of spaces stresses the whitespace-collapsing
    // regexes. With the old unbounded \s\s+/\s+ patterns this call takes several
    // seconds (quadratic); with bounded quantifiers it stays well under 1s.
    const longSpaces = ' '.repeat(60000);
    const start = Date.now();
    prettyPrintObject({ data: { field: [longSpaces] } });
    const durationMs = Date.now() - start;

    expect(durationMs).toBeLessThan(2000);
  });
});
