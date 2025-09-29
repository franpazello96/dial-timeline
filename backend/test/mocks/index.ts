export const mockPrismaUser = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  findMany: jest.fn(),
};

export const mockPrismaPost = {
  deleteMany: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
};

export const mockPrismaLike = {
  deleteMany: jest.fn(),
  groupBy: jest.fn(),
  findMany: jest.fn(),
};

export const mockPrisma = {
  user: mockPrismaUser,
  post: mockPrismaPost,
  like: mockPrismaLike,
};


export const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};


jest.mock('../../src/lib/prisma', () => ({
  prisma: mockPrisma,
}));

jest.mock('bcrypt', () => mockBcrypt);