export type ChangeData = {
  old: string;
  new: string;
  field: string;
};

export type ChangeListData = {
  changes: ChangeData[];
  reason: string;
  user: string;
  date: string;
};
