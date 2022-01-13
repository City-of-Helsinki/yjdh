const isRealIntegrationsEnabled = (): boolean =>
  !['1', true, 'true'].includes(
    process.env.NEXT_PUBLIC_MOCK_FLAG?.toLowerCase() ?? false
  );

export default isRealIntegrationsEnabled;
