export type ChangeData = {
  old: string;
  new: string;
  field: string;
  meta?: string;
};

type User = {
  name: string;
  staff: boolean;
};

export type ChangeListData = {
  changes: ChangeData[];
  reason: string;
  user: User;
  date: string;
};
