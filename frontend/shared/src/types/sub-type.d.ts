type SubType<T, V> = Pick<
  Base,
  {
    [Key in keyof T]: Base[Key] extends V ? Key : never;
  }[keyof T]
>;

export default SubType;
