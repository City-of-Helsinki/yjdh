import * as Sentry from '@sentry/nextjs';
import { createSentryCommonOptions } from '../shared/src/config/sentry-common';

Sentry.init(createSentryCommonOptions());
