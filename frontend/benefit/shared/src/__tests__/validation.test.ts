import { validateNumberField } from 'benefit-shared/utils/validation';

const texts = {
  typeError: 'Must be a number',
  required: 'Required',
};

describe('validateNumberField', () => {
  const schema = validateNumberField(0, 100, texts);

  it('should accept a valid number within range', async () => {
    await expect(schema.validate(50)).resolves.toBe(50);
  });

  it('should accept the minimum value', async () => {
    await expect(schema.validate(1)).resolves.toBe(1);
  });

  it('should accept the maximum value', async () => {
    await expect(schema.validate(100)).resolves.toBe(100);
  });

  it('should reject a number below minimum', async () => {
    await expect(schema.validate(-1)).rejects.toThrow();
  });

  it('should reject a number above maximum', async () => {
    await expect(schema.validate(101)).rejects.toThrow();
  });

  it('should reject non-numeric strings', async () => {
    await expect(schema.validate('abc')).rejects.toThrow();
  });

  it('should transform numeric strings to numbers', async () => {
    await expect(schema.validate('42')).resolves.toBe(42);
  });

  it('should reject undefined (required)', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    await expect(schema.validate(undefined)).rejects.toThrow();
  });
});
