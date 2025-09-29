import { z } from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt'
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function Auth(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/login', {
    schema: {
      body: z.object({
        email: z.email("Email inválido"),
        password: z.string().min(6, "Password deve ter pelo menos 6 caracteres"),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          token: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            name: z.string(),
          })
        }),
        400: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        401: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
        })
      }
    },
   }, async (request, reply) => {
      const { email, password } = request.body;
      
      try {
        if(!email || !password) {
          return reply.status(400).send({
            success: false,
            message: 'Email e senha são obrigatórios'
          })
        }

        const user = await prisma.user.findUnique({
          where: { email }
        })
        
        if (!user) {
          return reply.status(401).send({
            success: false,
            message: 'Email ou senha inválidos'
          })
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password)
        
        if (!isPasswordValid) {
          return reply.status(401).send({
            success: false,
            message: 'Senha inválida'
          })
        }

        if(password.length < 6) {
          return reply.status(400).send({
            success: false,
            message: 'Password deve ter pelo menos 6 caracteres'
          })
        }
        
        const token = await reply.jwtSign({
          id: user.id,
          email: user.email,
        })
        
        return reply.status(200).send({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        })
      } catch (error) {
        console.error('Erro no login:', error)
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        })
      }
    })

  app.withTypeProvider<ZodTypeProvider>().post('/register', {
    schema: {
      body: z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.email("Email inválido"),
        password: z.string().min(6, "Password deve ter pelo menos 6 caracteres"),
      }),
      response: {
        201: z.object({
          success: z.boolean(),
          message: z.string(),
          user: z.object({
            id: z.string(),
            email: z.email("Email inválido"),
            name: z.string(),
          })
        }),
        400: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
        })
      }
    },
  }, async (request, reply) => {
    const { name, email, password } = request.body;
    
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return reply.status(400).send({
          success: false,
          message: 'Usuário já existe com este email'
        });
      }
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      });
      
      return reply.status(201).send({
        success: true,
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  })
}