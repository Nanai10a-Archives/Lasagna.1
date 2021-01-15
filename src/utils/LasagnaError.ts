class LasagnaError<T extends string, O> {
  readonly type: T;
  readonly message: string;
  readonly others: O;

  constructor(t: T, message: string, others: O) {
    this.type = t;
    this.message = message;
    this.others = others;
  }
}

export default LasagnaError;
