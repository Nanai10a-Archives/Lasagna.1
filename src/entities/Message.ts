import Logs from "./Logs";

type Message = {
  uuid: string;
  contents: string;
  logs: Logs<Message>;
};

export default Message;
