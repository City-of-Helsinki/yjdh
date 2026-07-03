const isHandlerNewBetaUiEnabled = (): boolean =>
  ['1', 'true', 'yes'].includes(
    process.env.NEXT_PUBLIC_ENABLE_HANDLER_NEW_BETA_UI?.toLowerCase() ?? ''
  );

export default isHandlerNewBetaUiEnabled;
