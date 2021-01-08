import User from "./User";
import Logs from "./Logs";
import Message from "./Message";

type Room = {
  uuid: string;
  name: string;
  description: string;
  users: Array<User>;
  messages: Array<Message>;
  logs: Logs<Room>;
};

export default Room;
