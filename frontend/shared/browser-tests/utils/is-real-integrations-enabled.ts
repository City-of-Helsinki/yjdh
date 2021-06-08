const isRealIntegrationsEnabled = (): boolean =>
  !['1', true, 'true'].includes(process.env.MOCK_FLAG?.toLowerCase() ?? false);

export default isRealIntegrationsEnabled;
