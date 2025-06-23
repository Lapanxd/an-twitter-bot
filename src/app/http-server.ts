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

  await fastify.listen({ port: 3002 });
  console.log('Server started on http://localhost:3002');
}
