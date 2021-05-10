import { formatDate } from '../../src/utils/date.utils';
import { getEmployerUiUrl } from '../utils/settings';
import { createSlackMessageSender } from './slackMessageSender';
import { emojis } from './utils/emojis';
import { bold, italics } from './utils/slackTextFormatters';

// https://devexpress.github.io/testcafe/documentation/reference/plugin-api/reporter.html#testruninfo-object
type TestRunInfo = {
  errs: Record<string, string>[];
  warnings: string[];
  durationMs: number;
  skipped: boolean;
};

type Result = {
  passedCount: number;
  failedCount: number;
  skippedCount: number;
};

type Reporter = {
  reportTaskStart: (start: number, userAgents: string, test: number) => void;
  reportFixtureStart: (fixtureName: string) => void;
  reportTestDone: (name: string, testRunInfo: TestRunInfo) => void;
  reportTaskDone: (
    endTime: number,
    passed: number,
    warnings: TestRunInfo['warnings'],
    result: Result
  ) => void;
};

/**
 * Custom slack reporter for testcafe:
 * https://github.com/ocassio/testcafe-reporter-custom
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const SlackReporter = (): Reporter => {
  let startTime: number;
  let testCount: number;
  const slack = createSlackMessageSender();

  const reportTaskStart = (
    start: number,
    userAgents: string,
    test: number
  ): void => {
    startTime = start;
    testCount = test;
    const githubWorkflow = process.env.GITHUB_WORKFLOW_NAME || '';
    const githubWorkflowUrl = process.env.GITHUB_WORKFLOW_URL || '';
    // prettier-ignore
    slack.addMessage(`${githubWorkflow}: ${getEmployerUiUrl()}\n
    Workflow Url: ${githubWorkflowUrl}\n` +
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    `${emojis.ROCKET} ${'Started TestCafe:'} ${bold(formatDate(startTime, 'dd.MM.yyyy HH:mm:ss'))}\n
    ${emojis.COMPUTER} Runned ${bold(String(testCount))} tests in: ${bold(userAgents)}\n`
    );
  };

  const getTestDoneMessage = (
    name: string,
    testRunInfo: TestRunInfo
    // eslint-disable-next-line unicorn/consistent-function-scoping
  ): string => {
    let message: string;
    if (testRunInfo.skipped) {
      message = `${emojis.FAST_FORWARD} ${italics(name)} - ${bold('skipped')}`;
    } else if (testRunInfo.errs.length > 0) {
      /* prettier-ignore */
      message = `${emojis.HEAVY_MULTIPLICATION} ${italics(name)} - ${bold('failed')}`;
    } else {
      message = `${emojis.HEAVY_CHECKMARK} ${italics(name)}`;
    }
    return message;
  };

  const reportTestDone = (name: string, testRunInfo: TestRunInfo): void => {
    slack.addMessage(getTestDoneMessage(name, testRunInfo));
  };

  const reportFixtureStart = (fixtureName: string): void => {
    slack.addMessage(bold(fixtureName));
  };

  const reportTaskDone = (
    endTime: number,
    passed: number,
    warnings: TestRunInfo['warnings'],
    result: Result
  ): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const endTimeFormatted = formatDate(endTime, 'dd.MM.yyyy HH:mm:ss');
    const durationMs = endTime - startTime;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const durationFormatted = formatDate(durationMs, "mm'm' ss's'");
    // prettier-ignore
    const finishedStr = `${emojis.FINISH_FLAG} Testing finished at ${bold(endTimeFormatted)}\n`;
    // prettier-ignore
    const durationStr = `${emojis.STOP_WATCH} Duration: ${bold(durationFormatted)}\n`;
    let summaryStr = '';

    if (result.skippedCount) {
      // prettier-ignore
      summaryStr += `${emojis.FAST_FORWARD} ${bold(`${result.skippedCount} skipped`)}\n`;
    }
    summaryStr += result.failedCount
      ? `${emojis.NO_ENTRY} ${bold(
          `${result.failedCount}/${testCount} failed`
        )}`
      : `${emojis.CHECK_MARK} ${bold(
          `${result.passedCount}/${testCount} passed`
        )}`;
    slack.addMessage(`\n\n${finishedStr} ${durationStr} ${summaryStr}`);

    slack.sendTestReport(testCount - passed);
  };

  return {
    reportTaskStart,
    reportFixtureStart,
    reportTestDone,
    reportTaskDone,
  };
};

export default SlackReporter;
