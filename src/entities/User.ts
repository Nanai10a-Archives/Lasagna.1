type User = {
  // 不変のUUIDv4
  readonly uuid: string;
  // FIXME: これなに
  readonly id: string;
  // twitterの[@...]みたいな
  sub_id: string;
  // 表示名
  name: string;
};

export default User;
