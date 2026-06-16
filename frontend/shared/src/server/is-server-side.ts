const isServerSide = (): boolean => globalThis.window === undefined;

export default isServerSide;
