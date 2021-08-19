import '@testing-library/jest-dom';

import { toHaveNoViolations } from 'jest-axe';

jest.setTimeout(20000);

expect.extend(toHaveNoViolations);
