import { formatDate } from '../../src/utils/date.utils';
import { getFrontendUrl } from '../utils/url.utils';
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

const getTestDoneMessage = (name: string, testRunInfo: TestRunInfo): string => {
  let message;
  if (testRunInfo.skipped) {
    message = `${emojis.fastForward} ${italics(name)} - ${bold('skipped')}`;
  } else if (testRunInfo.errs.length > 0) {
    /* prettier-ignore */
    message = `${emojis.heavyMultiplication} ${italics(name)} - ${bold('failed')}`;
  } else {
    message = `${emojis.heavyCheckMark} ${italics(name)}`;
  }
  return message;
};

/**
 * Custom slack reporter for testcafe:
 * https://github.com/ocassio/testcafe-reporter-custom
 */
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
    slack.addMessage(
    `${githubWorkflow}: ${getFrontendUrl()}\n
    Workflow Url: ${githubWorkflowUrl}\n
    ${emojis.rocket} ${'Started Browser-tests:'} ${bold(formatDate(startTime, 'dd.MM.yyyy HH:mm:ss'))}\n
    ${emojis.computer} Runned ${bold(String(testCount))} tests in: ${bold(userAgents)}\n`
    );
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
    const endTimeFormatted = formatDate(endTime, 'dd.MM.yyyy HH:mm:ss');
    const durationMs = endTime - startTime;
    const durationFormatted = formatDate(durationMs, "mm'm' ss's'");
    // prettier-ignore
    const finishedStr = `${emojis.finishFlag} Testing finished at ${bold(endTimeFormatted)}\n`;
    // prettier-ignore
    const durationStr = `${emojis.stopWatch} Duration: ${bold(durationFormatted)}\n`;
    let summaryStr = '';

    if (result.skippedCount) {
      // prettier-ignore
      summaryStr += `${emojis.fastForward} ${bold(`${result.skippedCount} skipped`)}\n`;
    }
    summaryStr += result.failedCount
      ? `${emojis.noEntry} ${bold(`${result.failedCount}/${testCount} failed`)}`
      : `${emojis.checkMark} ${bold(
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
