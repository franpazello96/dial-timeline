import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import bcrypt from 'bcrypt'
import { prisma } from "../lib/prisma";
import { authenticate } from "../lib/auth-middleware";

export async function User( app: FastifyInstance ){  
  // GET /profile - Obter perfil do usuário autenticado
  app.withTypeProvider<ZodTypeProvider>().get('/profile', {
    preHandler: authenticate,
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
          user: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            avatarUrl: z.string().nullable(),
            created_at: z.date(),
          })
        }),
        401: z.object({ 
          success: z.boolean(),
          message: z.string(),
        }),
        404: z.object({ 
          success: z.boolean(),
          message: z.string(),
        }),
        500: z.object({ 
          success: z.boolean(),
          message: z.string(),
        })
      },
    }
  }, async ( request , reply ) => {
    try {
      const userPayload = request.user as { id: string; email: string };
      
      const user = await prisma.user.findUnique({
        where: { id: userPayload.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          created_at: true,
        }
      });

      if (!user) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Usuário não encontrado' 
        });
      }

      return reply.status(200).send({ 
        success: true, 
        user 
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  })

  // PUT /profile - Atualizar perfil do usuário autenticado
  app.withTypeProvider<ZodTypeProvider>().put('/profile', {
    preHandler: authenticate,
    schema: {
      body: z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
        email: z.email("Email inválido").optional(),
        avatarUrl: z.string().optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          user: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            avatarUrl: z.string().nullable(),
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
  }, async ( request, reply ) => {
    try {
      const userPayload = request.user as { id: string; email: string };
      const { name, email, avatarUrl } = request.body;
      
      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id: userPayload.id }
      });

      if (!existingUser) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Usuário não encontrado' 
        });
      }

      // Se está tentando mudar email, verificar se não está em uso
      if (email && email !== existingUser.email) {
        const emailInUse = await prisma.user.findUnique({
          where: { email }
        });
        
        if (emailInUse) {
          return reply.status(400).send({
            success: false,
            message: 'Este email já está em uso'
          });
        }
      }

      let updateData: any = {};
      
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      const updatedUser = await prisma.user.update({
        where: { id: userPayload.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        }
      });

      return reply.status(200).send({ 
        success: true,
        message: 'Perfil atualizado com sucesso', 
        user: updatedUser 
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  })  
  
  // DELETE /profile - Deletar conta do usuário autenticado
  app.withTypeProvider<ZodTypeProvider>().delete('/profile', {
    preHandler: authenticate,
    schema: {
      body: z.object({
        password: z.string().min(1, "Senha é obrigatória para deletar a conta"),
        confirmation: z.literal("DELETE_MY_ACCOUNT", {
          message: 'Digite "DELETE_MY_ACCOUNT" para confirmar'
        })
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
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
    }
  }, async ( request , reply ) => {
    try {
      const userPayload = request.user as { id: string; email: string };
      const { password, confirmation } = request.body;

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userPayload.id }
      });

      if (!user) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Usuário não encontrado' 
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return reply.status(400).send({
          success: false,
          message: 'Senha incorreta'
        });
      }

      // Deletar usuário (isso também deletará posts e likes por CASCADE)
      await prisma.user.delete({ 
        where: { id: userPayload.id } 
      });

      return reply.status(200).send({ 
        success: true,
        message: 'Conta deletada com sucesso' 
      });
    } catch (error) {    
      console.error('Erro ao deletar usuário:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  })
}
