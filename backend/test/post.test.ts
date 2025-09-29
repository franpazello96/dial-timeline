import type { FastifyInstance } from "fastify";
import { buildTestServer } from "./helpers/test-server";
import { mockPrisma, mockBcrypt } from './mocks';

describe('Testes de Posts', () => {

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
  
  test('Criar um post com sucesso', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Usuário Teste',
      email: 'teste@exemplo.com',
      password: 'hashed-password',
      avatarUrl: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockPost = {
      id: 'post-123',
      content: 'Conteúdo do novo post',
      user_id: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(true);
    mockPrisma.post.create.mockResolvedValue(mockPost);

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'teste@exemplo.com',
        password: '123456',
      },
    });

    const { token } = JSON.parse(loginResponse.body);

    const response = await server.inject({
      method: 'POST',
      url: '/posts',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        content: 'Conteúdo do novo post',
      },
    });

    expect(response.statusCode).toBe(201);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).toBe('Post created');
    expect(responseBody.post.content).toBe('Conteúdo do novo post');
  });

  test('Falha ao criar post sem autenticação', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/posts',
      payload: {
        content: 'Conteúdo do novo post',
      },
    });

    expect(response.statusCode).toBe(401);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).toBe('Token de autenticação inválido ou ausente');
  });

  test('Falha ao criar post com conteúdo vazio', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Usuário Teste',
      email: 'teste@exemplo.com',
      password: 'hashed-password',
      avatarUrl: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(true);

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'teste@exemplo.com',
        password: '123456',
      },
    });

    const { token } = JSON.parse(loginResponse.body);

    const response = await server.inject({
      method: 'POST',
      url: '/posts',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        content: '',
      },
    });
    expect(response.statusCode).toBe(400);
  });


  test('Listar posts com sucesso', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Usuário Teste',
      email: 'teste@exemplo.com',
      password: 'hashed-password',
      avatarUrl: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(true);

    mockPrisma.post.findMany.mockResolvedValue([]);
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.like.groupBy.mockResolvedValue([]);
    mockPrisma.like.findMany.mockResolvedValue([]);

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'teste@exemplo.com',
        password: '123456',
      },
    });

    const { token } = JSON.parse(loginResponse.body);

    const response = await server.inject({
      method: 'GET',
      url: '/posts',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const responseBody = JSON.parse(response.body);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody).toHaveLength(0);
  });

  test('Falha ao listar posts sem autenticação', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/posts',
    });

    expect(response.statusCode).toBe(401);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).toBe('Token de autenticação inválido ou ausente');
  });


});
