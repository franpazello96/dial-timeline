import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../lib/auth-middleware";

export async function Post ( app: FastifyInstance ){

  app.withTypeProvider<ZodTypeProvider>()
  .post('/posts', {
    preHandler: authenticate,
    schema: {
      body: z.object({
        content: z.string().min(1),
      }),
      response: {
        201: z.object({ 
          message: z.string(),
          post: z.object({
            id: z.string().uuid(),
            content: z.string(),
            user_id: z.string().uuid(),
            created_at: z.date(),
            updated_at: z.date(),
          })
        }),
        400: z.object({ 
          message: z.string(), 
          error: z.any().optional(),
        })
      }
    }, 
  } , async ( request, reply ) => {
    try {
      const { content } = request.body
      const user_id = (request.user as { id: string; email: string }).id; 
      
      const post = await prisma.post.create({
        data: {
          content,
          user_id: user_id,
        }
    })
    return reply.status(201).send({ message: 'Post created', post })
    }
    catch (error) {
      return reply.status(400).send({ message: 'Error creating post', error })
    }
  })
  
  app.withTypeProvider<ZodTypeProvider>()
  .get('/posts', {
    preHandler: authenticate,
    schema: {
      response: {
        200: z.array(z.object({
          id: z.uuid(),
          content: z.string(),
          created_at: z.date(),
          updated_at: z.date(),
          user_id: z.uuid(),
          user: z.object({
            name: z.string(),
            avatarUrl: z.string()
          }),
          likes: z.int(),
          isLiked: z.boolean(),
        })),
        404: z.object({ 
          success: z.boolean(), 
          message: z.string(),
          error: z.any().optional(),
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
        })
      }
    }
  } , async ( request , reply ) => {
    try {
      const userPayload = request.user as { id: string; email: string };
      const currentUserId = userPayload.id;

      const posts = await prisma.post.findMany({
        orderBy: { created_at: 'desc' }
      })
      
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      })
      
      const likesCount = await prisma.like.groupBy({
        by: ['post_id'],
        _count: {
          post_id: true,
        }
      })

      const userLikes = await prisma.like.findMany({
        where: {
          user_id: currentUserId
        },
        select: {
          post_id: true
        }
      })

      if(!posts || posts.length === 0){
        return reply.status(200).send([])
      }

      return reply.status(200).send(posts.map(post => {
        const like = likesCount.find(like => like.post_id === post.id)
        const user = users.find(user => post.user_id === user.id)
        const isLiked = userLikes.some(userLike => userLike.post_id === post.id)
        
        return {
          ...post,
          user: { 
            name: user ? user.name : "Unknown",
            avatarUrl: user && user.avatarUrl ? user.avatarUrl : "",
          },
          likes: like ? like._count.post_id : 0,
          isLiked
        }
      }))
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  })
}