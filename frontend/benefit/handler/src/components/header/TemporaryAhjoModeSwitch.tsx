import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { ButtonPresetTheme, ButtonSize, ButtonVariant } from 'hds-react';
import React from 'react';
import Button from 'shared/components/button/Button';
import {
  removeLocalStorageItem,
  setLocalStorageItem,
} from 'shared/utils/localstorage.utils';

const reloadPage = (): void => {
  globalThis.location.reload();
};

const toggleNewAhjoMode = (isNewMode: boolean, onReload: () => void): void => {
  // eslint-disable-next-line no-alert
  const confirm = isNewMode
    ? // eslint-disable-next-line no-alert
      globalThis.confirm(
        'Haluatko palata vanhaan koontipohjaiseen käyttöliittymään?'
      )
    : // eslint-disable-next-line no-alert
      globalThis.confirm('Ota Ahjo-integraation käyttöliittymä käyttöön?');
  if (!confirm) return;
  if (isNewMode) {
    removeLocalStorageItem('newAhjoMode');
  } else {
    setLocalStorageItem('newAhjoMode', '1');
  }
  onReload();
};

type TemporaryAhjoModeSwitchProps = {
  // Allows tests to observe the reload without relying on jsdom internals.
  onReload?: () => void;
};

const TemporaryAhjoModeSwitch: React.FC<TemporaryAhjoModeSwitchProps> = ({
  onReload = reloadPage,
}) => {
  const isNewAhjoMode = useDetermineAhjoMode();
  return (
    <Button
      iconEnd={undefined} // HDS Button requires an icon for supplementary variant. Set to undefined to avoid TS error.
      onClick={() => toggleNewAhjoMode(isNewAhjoMode, onReload)}
      theme={ButtonPresetTheme.Coat}
      variant={ButtonVariant.Supplementary}
      size={ButtonSize.Small}
    >
      <span>
        Ahjo-integraatio
        <br />
        {isNewAhjoMode ? 'on päällä' : 'on pois päältä'}
      </span>
    </Button>
  );
};

export default TemporaryAhjoModeSwitch;
