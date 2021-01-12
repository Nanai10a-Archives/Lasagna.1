import socket from "socket.io";

const socket_setup = (io: socket.Server): void => {
  io.on("connection", (connection: socket.Socket) => {
    console.log("a user connected");

    connection.on("chat message", (message) => {
      io.emit("chat message", message);
    });
  });
};

export default socket_setup;
