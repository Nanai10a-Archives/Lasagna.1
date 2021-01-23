import socket from "socket.io";
import init_signaling from "../webrtc/signaling";

const socket_setup = (io: socket.Server): void => {
  io.on("connection", (connection: socket.Socket) => {
    console.log("a user connected");

    connection.on("chat message", (message) => {
      io.emit("chat message", message);
    });
  });

  init_signaling(io);
};

export default socket_setup;
