interface Result<T, E> {
  readonly t: T | null;
  readonly e: E | null;
}

export class Ok<T> implements Result<T, null> {
  readonly e: null = null;
  readonly t: T | null;

  constructor(t: T) {
    this.t = t;
  }
}

export class Err<E> implements Result<null, E> {
  readonly e: E | null;
  readonly t: null = null;

  constructor(e: E) {
    this.e = e;
  }
}

export default Result;
