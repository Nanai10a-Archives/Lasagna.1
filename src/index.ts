import fastify from "fastify";
import fastify_nextjs from "fastify-nextjs";
import socket from "socket.io";
import fs from "fs";
import path from "path";

const server = fastify({
  logger: true,
  https: {
    key: fs.readFileSync(path.join(__dirname + "/key.pem")),
    cert: fs.readFileSync(path.join(__dirname + "/cert.pem")),
  },
});

const io = new socket.Server(server.server);

server.register(fastify_nextjs).after(() => {
  server.next("/");
});

io.on("connection", (connection: socket.Socket) => {
  console.log("a user connected");

  connection.on("chat message", (message) => {
    io.emit("chat message", message);
  });
});

const run = async () => {
  try {
    await server.listen(3000, "0.0.0.0");
  } catch (e) {
    server.log.error(e);
    process.exit(1);
  }
};

run()
  .then()
  .catch((reason) => {
    console.error(reason);
    process.exit(1);
  });
