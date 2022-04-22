type Nullable<T> = {
  [K in keyof T]: Nullable<T[K]> | null;
};

export default Nullable;
