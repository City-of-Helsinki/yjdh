import '@testing-library/jest-dom';

import { toHaveNoViolations } from 'jest-axe';
import JEST_TIMEOUT from 'shared/__tests__/utils/jest-timeout';


jest.setTimeout(JEST_TIMEOUT);

expect.extend(toHaveNoViolations);
