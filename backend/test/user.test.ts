import { FastifyInstance } from 'fastify';
import { mockPrisma, mockBcrypt } from './mocks';
import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import fastifyjwt from '@fastify/jwt';
import { User } from '../src/routes/user';

beforeEach(() => {
  jest.resetAllMocks();
});

async function buildUserTestServer() {
  const server = fastify();

  server.register(fastifyjwt, {
    secret: 'test-secret',
    sign: { expiresIn: '7d' },
  });

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.register(User);

  return server;
}

describe('Testes de Usuários', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildUserTestServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function generateValidToken(userId: string = 'user-123', email: string = 'test@example.com') {
    return server.jwt.sign({
      id: userId,
      email: email
    });
  }

  describe('GET /profile', () => {
    it('deve retornar o perfil do usuário quando autenticado', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'João Silva',
        email: 'joao@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        created_at: new Date('2023-01-01T00:00:00.000Z'),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const token = generateValidToken();

      const response = await server.inject({
        method: 'GET',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.user).toEqual({
        ...mockUser,
        created_at: mockUser.created_at.toISOString()
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          created_at: true,
        }
      });
    });

    it('deve retornar erro 401 quando não está autenticado', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/profile',
      });

      expect(response.statusCode).toBe(401);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Token de autenticação inválido ou ausente');

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando o token é inválido', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/profile',
        headers: {
          authorization: 'Bearer token-invalido',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Token de autenticação inválido ou ausente');

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 quando o usuário não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const token = generateValidToken();

      const response = await server.inject({
        method: 'GET',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Usuário não encontrado');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          created_at: true,
        }
      });
    });

    it('deve retornar erro 500 quando ocorre erro interno no banco', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Erro de conexão'));

      const token = generateValidToken();

      const response = await server.inject({
        method: 'GET',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(500);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Erro interno do servidor');

      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('PUT /profile', () => {
    it('deve atualizar o perfil do usuário com sucesso', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'joao@example.com',
        name: 'João Silva',
        avatarUrl: null,
      };

      const updatedUser = {
        id: 'user-123',
        name: 'João Santos',
        email: 'joao.santos@example.com',
        avatarUrl: 'https://example.com/new-avatar.jpg',
      };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(existingUser) 
        .mockResolvedValueOnce(null); 

      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const token = generateValidToken();

      const response = await server.inject({
        method: 'PUT',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          name: 'João Santos',
          email: 'joao.santos@example.com',
          avatarUrl: 'https://example.com/new-avatar.jpg',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.message).toBe('Perfil atualizado com sucesso');
      expect(responseBody.user).toEqual(updatedUser);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          name: 'João Santos',
          email: 'joao.santos@example.com',
          avatarUrl: 'https://example.com/new-avatar.jpg',
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        }
      });
    });

    it('deve retornar erro 401 quando não está autenticado', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/profile',
        payload: {
          name: 'Novo Nome',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Token de autenticação inválido ou ausente');

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando o email já está em uso', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'joao@example.com',
        name: 'João Silva',
      };

      const emailInUseUser = {
        id: 'user-456',
        email: 'outro@example.com',
      };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(existingUser) 
        .mockResolvedValueOnce(emailInUseUser); 

      const token = generateValidToken();

      const response = await server.inject({
        method: 'PUT',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          email: 'outro@example.com',
        },
      });

      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Este email já está em uso');

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando o usuário não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const token = generateValidToken();

      const response = await server.inject({
        method: 'PUT',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          name: 'Novo Nome',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Usuário não encontrado');

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando o nome é muito curto (validação interna)', async () => {
      const token = generateValidToken();

      const response = await server.inject({
        method: 'PUT',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          name: 'A',
        },
      });

      expect(response.statusCode).toBe(500);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando o email é inválido (validação interna)', async () => {
      const token = generateValidToken();

      const response = await server.inject({
        method: 'PUT',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          email: 'email-invalido',
        },
      });

      expect(response.statusCode).toBe(500);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando ocorre erro interno no banco', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Erro de conexão'));

      const token = generateValidToken();

      const response = await server.inject({
        method: 'PUT',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          name: 'Novo Nome',
        },
      });

      expect(response.statusCode).toBe(500);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Erro interno do servidor');

      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('DELETE /profile', () => {
    it('deve deletar a conta do usuário com sucesso', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'joao@example.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.delete.mockResolvedValue(existingUser);
      mockBcrypt.compare.mockResolvedValue(true);

      const token = generateValidToken();

      const response = await server.inject({
        method: 'DELETE',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          password: 'senha-correta',
          confirmation: 'DELETE_MY_ACCOUNT',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.message).toBe('Conta deletada com sucesso');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('senha-correta', 'hashed-password');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      });
    });

    it('deve retornar erro 401 quando não está autenticado', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/profile',
        payload: {
          password: 'senha',
          confirmation: 'DELETE_MY_ACCOUNT',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Token de autenticação inválido ou ausente');

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando a senha está incorreta', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'joao@example.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockBcrypt.compare.mockResolvedValue(false);

      const token = generateValidToken();

      const response = await server.inject({
        method: 'DELETE',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          password: 'senha-incorreta',
          confirmation: 'DELETE_MY_ACCOUNT',
        },
      });

      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Senha incorreta');

      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando o usuário não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const token = generateValidToken();

      const response = await server.inject({
        method: 'DELETE',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          password: 'senha',
          confirmation: 'DELETE_MY_ACCOUNT',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Usuário não encontrado');

      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando a senha não é fornecida (validação interna)', async () => {
      const token = generateValidToken();

      const response = await server.inject({
        method: 'DELETE',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          confirmation: 'DELETE_MY_ACCOUNT',
        },
      });

      expect(response.statusCode).toBe(500);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando a confirmação está incorreta (validação interna)', async () => {
      const token = generateValidToken();

      const response = await server.inject({
        method: 'DELETE',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          password: 'senha',
          confirmation: 'CONFIRMACAO_ERRADA',
        },
      });

      expect(response.statusCode).toBe(500);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando ocorre erro interno no banco', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Erro de conexão'));

      const token = generateValidToken();

      const response = await server.inject({
        method: 'DELETE',
        url: '/profile',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          password: 'senha',
          confirmation: 'DELETE_MY_ACCOUNT',
        },
      });

      expect(response.statusCode).toBe(500);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Erro interno do servidor');

      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    });
  });
});
