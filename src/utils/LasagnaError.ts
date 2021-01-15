class LasagnaError<T extends string, P> {
  readonly type: T;
  readonly message: string;
  readonly props: P;

  constructor(t: T, message: string, props: P) {
    this.type = t;
    this.message = message;
    this.props = props;
  }
}

export default LasagnaError;
