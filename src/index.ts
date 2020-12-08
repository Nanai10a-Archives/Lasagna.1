import fastify from "fastify";
import fastify_socket from "fastify-socket.io";
import { Socket } from "socket.io";
import fs from "fs";
import path from "path";

const server = fastify({
  logger: true,
  https: {
    key: fs.readFileSync(path.join(__dirname + "/key.pem")),
    cert: fs.readFileSync(path.join(__dirname + "/cert.pem")),
  },
});
server.register(fastify_socket);

server.get("/", async (req, rep) => {
  rep.type("text/html");
  rep.send(fs.readFileSync(path.join(__dirname + "/index.html")).toString());

  server.io.on("connection", (socket: Socket) => {
    console.log("a user connected");
    socket.on("chat message", (message) => {
      server.io.emit("chat message", message);
    });
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
