import * as Fastify from "fastify";
import fs from "fs";
import path from "path";

const fastify_setup = (): Fastify.FastifyInstance => {
  return Fastify.fastify({
    logger: {
      prettyPrint: {
        colorize: true,
      },
    },
    https: {
      key: fs.readFileSync(path.join(__dirname, "../../private/key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "../../private/cert.pem")),
    },
  });
};

export default fastify_setup;
