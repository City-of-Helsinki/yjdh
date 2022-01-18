type TetPosting = {
  id?: string;
  title: string;
  description: string;
  // TODO react-hook-forms gets this as a string from `NumberInput`
  // but NumberInput expects it as a number
  spots: number;
  start_date: string;
  end_date?: string;
};

export default TetPosting;
