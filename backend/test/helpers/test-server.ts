import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import fastifyjwt from '@fastify/jwt';
import { Auth } from '../../src/routes/auth';
import { Post } from '../../src/routes/post';

export async function buildTestServer() {
  const server = fastify();

  server.register(fastifyjwt, {
    secret: 'test-secret',
    sign: { expiresIn: '7d' },
  });

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.register(Auth);
  server.register(Post);

  return server;
}