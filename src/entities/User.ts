type User = {
  // 不変のUUIDv4
  readonly uuid: string;
  // twitterの[@...]みたいな
  id: string;
  // 表示名
  name: string;
};

export default User;
