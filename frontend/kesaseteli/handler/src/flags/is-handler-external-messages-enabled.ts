const isHandlerExternalMessagesEnabled = (): boolean =>
  ['1', 'true', 'yes'].includes(
    process.env.NEXT_PUBLIC_ENABLE_HANDLER_EXTERNAL_MESSAGES?.toLowerCase() ?? ''
  );

export default isHandlerExternalMessagesEnabled;
