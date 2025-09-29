import fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyjwt from '@fastify/jwt'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, } from 'fastify-type-provider-zod'
import { Post } from './routes/post'
import { Auth } from './routes/auth'
import { Like } from './routes/like'
import { User } from './routes/user'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

const server = fastify()

server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
})

server.register(fastifyjwt, {
  secret: 'supersecret',
  sign: { expiresIn: '7d' },
})

server.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Dialog Timeline API',
      description: 'API Specification for the Backend of a Timeline Application Developed for the Fullstack Developer Test at Dialog',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  transform: jsonSchemaTransform
});

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(Post)
server.register(Auth)
server.register(Like)
server.register(User)

server.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})