import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { Button } from 'hds-react';
import React from 'react';
import {
  removeLocalStorageItem,
  setLocalStorageItem,
} from 'shared/utils/localstorage.utils';

const toggleNewAhjoMode = (isNewMode: boolean): void => {
  // eslint-disable-next-line no-alert
  const confirm = isNewMode
    ? // eslint-disable-next-line no-alert
      window.confirm(
        'Haluatko palata vanhaan koontipohjaiseen käyttöliittymään?'
      )
    : // eslint-disable-next-line no-alert
      window.confirm('Ota Ahjo-integraation käyttöliittymä käyttöön?');
  if (!confirm) return;
  if (!isNewMode) {
    setLocalStorageItem('newAhjoMode', '1');
  } else {
    removeLocalStorageItem('newAhjoMode');
  }
  window.location.reload();
};

const TemporaryAhjoModeSwitch: React.FC = () => {
  const isNewAhjoMode = useDetermineAhjoMode();
  return (
    <Button
      iconRight={null}
      onClick={() => toggleNewAhjoMode(isNewAhjoMode)}
      theme="coat"
      variant="supplementary"
      size="small"
    >
      Ahjo-kokeilu
      <br />
      {isNewAhjoMode ? 'on päällä' : 'on pois päältä'}
    </Button>
  );
};

export default TemporaryAhjoModeSwitch;
