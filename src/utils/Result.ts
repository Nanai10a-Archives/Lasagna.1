interface _Result<T, E> {
  readonly t: T | null;
  readonly e: E | null;
}

type Result<T, E> = _Result<T | null, E | null>;

export class Ok<T> implements Result<T, null> {
  readonly t: T;
  readonly e: null = null;

  constructor(t: T) {
    this.t = t;
  }
}

export class Err<E> implements Result<null, E> {
  readonly t: null = null;
  readonly e: E | null;

  constructor(e: E) {
    this.e = e;
  }
}

export default Result;
