import * as NextServer from "next/dist/next-server/server/next-server";
import * as Fastify from "fastify";

const next_setup = async (
  next: NextServer.default,
  server: Fastify.FastifyInstance,
): Promise<void> => {
  await next.prepare();
  const next_handler = next.getRequestHandler();

  server.all("*", (req, rep) => {
    next_handler(req.raw, rep.raw);
  });
};

export default next_setup;
