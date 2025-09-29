import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../lib/auth-middleware";

export async function Like ( app: FastifyInstance ){

  // POST /posts/:id/like - Toggle like/unlike no post
  app.withTypeProvider<ZodTypeProvider>()
  .post('/posts/:id/like', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        id: z.uuid("ID do post inválido"),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          action: z.enum(['liked', 'unliked']),
          likesCount: z.number(),
        }),
        400: z.object({
          success: z.boolean(),
          message: z.string(),
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
  }, async ( request, reply ) => {
    try {
      const { id: post_id } = request.params;
      const userPayload = request.user as { id: string; email: string };
      const user_id = userPayload.id;

      // Verificar se o post existe
      const post = await prisma.post.findUnique({
        where: { id: post_id }
      });

      if (!post) {
        return reply.status(404).send({
          success: false,
          message: 'Post não encontrado'
        });
      }

      // Verificar se o usuário já curtiu este post
      const existingLike = await prisma.like.findFirst({
        where: {
          user_id,
          post_id
        }
      });

      let action: 'liked' | 'unliked';

      if (existingLike) {
        // Se já curtiu, remove o like (unlike)
        await prisma.like.delete({
          where: { id: existingLike.id }
        });
        action = 'unliked';
      } else {
        // Se não curtiu, adiciona o like
        await prisma.like.create({
          data: {
            user_id,
            post_id
          }
        });
        action = 'liked';
      }

      // Contar total de likes do post
      const likesCount = await prisma.like.count({
        where: { post_id }
      });

      return reply.status(200).send({
        success: true,
        message: action === 'liked' ? 'Post curtido com sucesso' : 'Like removido com sucesso',
        action,
        likesCount
      });

    } catch (error) {
      console.error('Erro ao processar like:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erro interno do servidor'
      });
    }
  })
}
