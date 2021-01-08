import Action from "./Action";

type Logs<T> = {
  create: Action;
  edit: Array<{
    action: Action;
    before: T;
    after: T;
  }>;
  delete: {
    action: Action;
    is_deleted: boolean;
  };
};

export default Logs;
