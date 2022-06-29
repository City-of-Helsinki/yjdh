const isSuomiFiEnabled = (): boolean =>
  ['1', true, 'true'].includes(
    process.env.NEXT_PUBLIC_ENABLE_SUOMIFI?.toLowerCase() ?? false
  );

export default isSuomiFiEnabled;
