import Next from "next";
import socket from "socket.io";

import fastify_setup from "./init/fastify";
import socket_setup from "./init/socket";
import next_setup from "./init/next";

const run = async () => {
  const fastify_next = fastify_setup();
  const fastify_socket = fastify_setup();

  socket_setup(new socket.Server(fastify_socket.server));
  await next_setup(Next({ dev: process.env.NODE_ENV === "development" }), fastify_next);

  await Promise.all([fastify_next.listen(4434, "0.0.0.0"), fastify_socket.listen(3000, "0.0.0.0")]);
};

run().catch((reason) => {
  console.error(reason);
  process.exit(1);
});
