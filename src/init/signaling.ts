import * as Socket from "socket.io";
import * as UUID from "uuid";

import Echo from "./wrtc";

const client_ids: Set<string> = new Set();
const echos: Set<string> = new Set();

const init_signaling = (connection: Socket.Socket): void => {
  connection.on("signaling_connect", (fn) => connect(connection, fn));
  connection.on("signaling_exists", exists);

  connection.on("signaling_request", (id, info) => request(connection, id, info));
  connection.on("signaling_offer", (id, info) => offer(connection, id, info));
  connection.on("signaling_answer", (id, info) => answer(connection, id, info));

  connection.on("signaling_close", (id, info) => close(connection, id, info));

  connection.on("signaling_test_echo", (fn) => testEcho(fn));
};

const connect = (connection: Socket.Socket, fn: (id: string) => void) => {
  const id = UUID.v4();
  connection.join(id);
  client_ids.add(id);
  fn(id);
};

const exists = (id: string, fn: (isExists: boolean) => void) => {
  fn(client_ids.has(id) && !echos.has(id));
};

const request = (connection: Socket.Socket, id: string, info: string) => {
  connection.to(id).emit("signaling_request", info);
};

const offer = (connection: Socket.Socket, id: string, info: string) => {
  connection.to(id).emit("signaling_offer", info);
};

const answer = (connection: Socket.Socket, id: string, info: string) => {
  connection.to(id).emit("signaling_answer", info);
};

const close = (connection: Socket.Socket, id: string, info: string) => {
  connection.to(id).emit("signaling_close", info);
};

// FIXME: もしやするとconnectionがroomにjoinしていないとroomからのメッセージを受け取れない？

const testEcho = (fn: (id: string) => void) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const echo = new Echo();

  echo.getId().then((id: string) => {
    echos.add(id);
    fn(id);
  });
};

export default init_signaling;
