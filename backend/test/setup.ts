import './mocks';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  jest.clearAllMocks();
});