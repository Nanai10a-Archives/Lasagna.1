import { FastifyInstance, FastifyServerOptions } from "fastify";
import * as fs from "fs";
import path from "path";

export const func = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: () => void,
): void => {
  fastify.get("/", async (req, rep) => {
    rep.type("text/html");
    rep.send(fs.readFileSync(path.join(__dirname + "/index.html")).toString());
  });

  done();
};
