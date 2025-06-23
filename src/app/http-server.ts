import 'reflect-metadata';
import Fastify from 'fastify';
import { postRepository } from './container';
import cors from '@fastify/cors';

export async function startServer() {
  const fastify = Fastify();

  await fastify.register(cors, {
    origin: '*',
  });

  fastify.get('/posts', async () => {
    return await postRepository.find();
  });

  const port = parseInt(process.env.PORT || '3002', 10);
  const host = process.env.HOST || '0.0.0.0';

  fastify.listen({ port, host }, () => {
    console.log(`Server started on http://${host}:${port}`);
  });
}
