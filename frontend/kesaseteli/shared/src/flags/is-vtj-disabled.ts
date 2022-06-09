const isVtjDisabled = (): boolean =>
  ['1', true, 'true'].includes(
    process.env.NEXT_PUBLIC_DISABLE_VTJ?.toLowerCase() ?? false
  );

export default isVtjDisabled;
