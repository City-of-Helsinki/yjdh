import getActivationLinkExpirationSeconds from 'kesaseteli/youth/utils/get-activation-link-expiration-seconds';
import React from 'react';

const useActivationLinkExpirationHours = (): number =>
  React.useMemo(
    () => Math.round(getActivationLinkExpirationSeconds() / 3600),
    []
  );

export default useActivationLinkExpirationHours;
