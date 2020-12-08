import { FastifyInstance, FastifyServerOptions } from "fastify";
import * as socket from "socket.io";

export const func = (
  _fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: () => void,
): void => {
  const fastify: FastifyInstance & { io: socket.Server } = _fastify as FastifyInstance & {
    io: socket.Server;
  };

  fastify.get("/", async () => {
    fastify.io.on("connection", (socket: socket.Socket) => {
      console.log("a user connected");

      socket.on("chat message", (message) => {
        socket.broadcast.emit("chat message", message);
      });
    });
  });

  done();
};
