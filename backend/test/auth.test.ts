import { FastifyInstance } from 'fastify';
import { buildTestServer } from './helpers/test-server';
import { mockPrisma, mockBcrypt } from './mocks';

describe('Testes de Autenticação', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildTestServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('deve fazer login com sucesso quando as credenciais estão corretas', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);

      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: 'teste@exemplo.com',
          password: '123456',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.token).toBeDefined();
      expect(responseBody.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'teste@exemplo.com' }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-password');
    });

    it('deve retornar erro 500 quando o email tem formato inválido', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: 'email-invalido', 
          password: '123456',
        },
      });

      expect(response.statusCode).toBe(500);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.message).toContain('Email inválido');

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando o usuário não existe no banco', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: 'usuario-inexistente@exemplo.com',
          password: '123456',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Email ou senha inválidos');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'usuario-inexistente@exemplo.com' }
      });
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando a senha está incorreta', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: 'teste@exemplo.com',
          password: 'senha-errada',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Senha inválida');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'teste@exemplo.com' }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('senha-errada', 'hashed-password');
    });

    it('deve retornar erro 500 quando a senha tem menos de 6 caracteres', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: 'teste@exemplo.com',
          password: '123', 
        },
      });

      expect(response.statusCode).toBe(500);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.message).toContain('Password deve ter pelo menos 6 caracteres');

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando o email não é fornecido', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          password: '123456',
        },
      });

      expect(response.statusCode).toBe(500);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando a senha não é fornecida', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: 'teste@exemplo.com',
        },
      });

      expect(response.statusCode).toBe(500);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando nenhum dado é fornecido', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {},
      });

      expect(response.statusCode).toBe(500);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando ocorre erro interno', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Erro de conexão'));

      const response = await server.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: 'teste@exemplo.com',
          password: '123456',
        },
      });

      expect(response.statusCode).toBe(500);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Erro interno do servidor');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'teste@exemplo.com' }
      });
    });
  });

  describe('POST /register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const mockCreatedUser = {
        id: 'new-user-123',
        name: 'Novo Usuário',
        email: 'novo@exemplo.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); 
      mockBcrypt.hash.mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const response = await server.inject({
        method: 'POST',
        url: '/register',
        payload: {
          name: 'Novo Usuário',
          email: 'novo@exemplo.com',
          password: '123456',
        },
      });

      expect(response.statusCode).toBe(201);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.message).toBe('Usuário criado com sucesso');
      expect(responseBody.user.email).toBe('novo@exemplo.com');
      expect(responseBody.user.name).toBe('Novo Usuário');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'novo@exemplo.com' }
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Novo Usuário',
          email: 'novo@exemplo.com',
          password: 'hashed-password',
        }
      });
    });

    it('deve retornar erro 400 quando tenta registrar email já existente', async () => {
      const mockExistingUser = {
        id: 'existing-user-123',
        name: 'Usuário Existente',
        email: 'existente@exemplo.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockExistingUser);

      const response = await server.inject({
        method: 'POST',
        url: '/register',
        payload: {
          name: 'Outro Usuário',
          email: 'existente@exemplo.com',
          password: '123456',
        },
      });

      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Usuário já existe com este email');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'existente@exemplo.com' }
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando ocorre erro durante o registro', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockRejectedValue(new Error('Erro de banco')); 

      const response = await server.inject({
        method: 'POST',
        url: '/register',
        payload: {
          name: 'Novo Usuário',
          email: 'novo@exemplo.com',
          password: '123456',
        },
      });

      expect(response.statusCode).toBe(500);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Erro interno do servidor');
    });
  });
});