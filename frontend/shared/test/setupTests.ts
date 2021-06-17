import '@testing-library/jest-dom';

import { toHaveNoViolations } from 'jest-axe';

jest.setTimeout(15000);

expect.extend(toHaveNoViolations);
