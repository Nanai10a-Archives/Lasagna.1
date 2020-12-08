import fastify from "fastify";
import fastify_socket from "fastify-socket.io";
import fs from "fs";
import path from "path";
import * as front from "./front";
import * as back from "./back";

const server = fastify({
  logger: true,
  https: {
    key: fs.readFileSync(path.join(__dirname + "/key.pem")),
    cert: fs.readFileSync(path.join(__dirname + "/cert.pem")),
  },
});

server.register(fastify_socket);
server.register(front.func, {
  prefix: "/front",
});
server.register(back.func, {
  prefix: "/back",
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
