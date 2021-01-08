type User = {
  // 不変のUUIDv4
  readonly uuid: string;
  // FIXME: これなに
  readonly id: string;
  // twitterの[@...]みたいな
  subId: string;
  // 表示名
  name: string;
};

export default User;
