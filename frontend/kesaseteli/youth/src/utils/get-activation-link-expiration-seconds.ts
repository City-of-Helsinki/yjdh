const TWELVE_HOURS_IN_SECONDS = 43_200;

const getActivationLinkExpirationSeconds = (): number =>
  Number(
    process.env.NEXT_PUBLIC_YOUTH_APPLICATION_ACTIVATION_LINK_EXPIRATION_SECONDS
  ) || TWELVE_HOURS_IN_SECONDS;

export default getActivationLinkExpirationSeconds;
