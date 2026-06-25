import '@testing-library/jest-dom';
import '../../../../test/i18n/i18n-test';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import React from 'react';
import {
  removeLocalStorageItem,
  setLocalStorageItem,
} from 'shared/utils/localstorage.utils';

import TemporaryAhjoModeSwitch from '../TemporaryAhjoModeSwitch';

jest.mock('benefit/handler/hooks/useDetermineAhjoMode');
jest.mock('shared/utils/localstorage.utils');

const mockUseDetermineAhjoMode = jest.mocked(useDetermineAhjoMode);
const mockSetLocalStorageItem = jest.mocked(setLocalStorageItem);
const mockRemoveLocalStorageItem = jest.mocked(removeLocalStorageItem);

const clickSwitch = async (): Promise<void> => {
  await userEvent.click(
    screen.getByRole('button', { name: /ahjo-integraatio/i })
  );
};

describe('TemporaryAhjoModeSwitch', () => {
  let reloadMock: jest.Mock;

  const renderSubject = (isNewMode: boolean, confirmResult = false): void => {
    mockUseDetermineAhjoMode.mockReturnValue(isNewMode);
    (globalThis.confirm as jest.Mock).mockReturnValue(confirmResult);
    renderComponent(<TemporaryAhjoModeSwitch onReload={reloadMock} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(globalThis, 'confirm').mockReturnValue(false);
    reloadMock = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    [false, 'on pois päältä'],
    [true, 'on päällä'],
  ])('renders correct text when mode is %s', (isNewMode, expectedText) => {
    renderSubject(isNewMode);
    const button = screen.getByRole('button', { name: /ahjo-integraatio/i });
    expect(button).toHaveTextContent(expectedText);
  });

  it.each([
    [false, 'Ota Ahjo-integraation käyttöliittymä käyttöön?'],
    [true, 'Haluatko palata vanhaan koontipohjaiseen käyttöliittymään?'],
  ])(
    'shows correct confirmation message when mode is %s',
    async (isNewMode, confirmationMessage) => {
      renderSubject(isNewMode);

      await clickSwitch();

      expect(globalThis.confirm).toHaveBeenCalledWith(confirmationMessage);
    }
  );

  it.each([
    [false, mockSetLocalStorageItem, 'newAhjoMode', '1'],
    [true, mockRemoveLocalStorageItem, 'newAhjoMode'],
  ])(
    'updates local storage and reloads when confirmed and mode is %s',
    async (isNewMode, expectedStorageCall, ...expectedArgs) => {
      renderSubject(isNewMode, true);

      await clickSwitch();

      expect(expectedStorageCall).toHaveBeenCalledWith(...expectedArgs);
      expect(reloadMock).toHaveBeenCalled();
    }
  );

  it('does not update local storage in either direction when user cancels', async () => {
    renderSubject(false, false);

    await clickSwitch();

    expect(mockSetLocalStorageItem).not.toHaveBeenCalled();
    expect(mockRemoveLocalStorageItem).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });
});
