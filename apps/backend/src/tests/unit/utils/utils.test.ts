import crypto from 'crypto';

import sql from '../../../config/database';
import RefreshToken from '../../../models/RefreshToken';
import { generatePagination, generateRefreshToken } from '../../../utils/utils';

jest.mock('../../../config/database', () => {
  const sqlMock = jest.fn((...args: unknown[]) => {
    if (Array.isArray(args[0])) {
      return [];
    }

    return { table: args[0] };
  });

  return {
    __esModule: true,
    default: sqlMock,
  };
});

jest.mock('../../../models/RefreshToken', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

describe('generatePagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns pagination links without next when there is no following page', async () => {
    const result = await generatePagination({
      content: [{ id: 1 }, { id: 2 }],
      tableName: 'components',
      hasSoftDelete: true,
      resourceRoute: 'components',
      limit: 2,
      offset: 0,
    });

    expect(result).toMatchObject({
      content: [{ id: 1 }, { id: 2 }],
      pagination: { limit: 2, offset: 0 },
      links: {
        start: '/components?offset=0&limit=2',
      },
    });
  });

  it('includes prev and next links when a previous and following page exist', async () => {
    const mockedSql = sql as unknown as jest.Mock;

    mockedSql.mockImplementation((...args: unknown[]) => {
      if (Array.isArray(args[0])) {
        return [{ id: 99 }];
      }

      return { table: args[0] };
    });

    const result = await generatePagination({
      content: [{ id: 3 }, { id: 4 }],
      tableName: 'components',
      hasSoftDelete: true,
      resourceRoute: 'components',
      limit: 2,
      offset: 2,
      otherParams: { search: 'drill' },
    });

    expect(result.links).toMatchObject({
      start: '/components?offset=0&limit=2&search=drill',
      prev: '/components?offset=0&limit=2&search=drill',
      next: '/components?offset=4&limit=2&search=drill',
    });
  });
});

describe('generateRefreshToken', () => {
  const userId = 42;
  const ip = '127.0.0.1';
  const userAgent = 'Jest-Agent/1.0';

  beforeEach(() => {
    jest.clearAllMocks();

    const randomBytesSpy = jest.spyOn(crypto, 'randomBytes') as jest.Mock;
    randomBytesSpy.mockImplementation(() => Buffer.from('a'.repeat(48)));

    const createHashSpy = jest.spyOn(crypto, 'createHash') as jest.Mock;
    createHashSpy.mockImplementation(() => {
      const hash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('b'.repeat(64)),
      } as unknown as crypto.Hash;

      return hash;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a refresh token with the correct user agent and IP metadata and sets the cookie', async () => {
    const res = { cookie: jest.fn() } as any;

    await generateRefreshToken(userId, true, res, ip, userAgent);

    expect(RefreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        token_hash: 'b'.repeat(64),
        remember: true,
        user_agent: userAgent,
        ip_address: ip,
        expires_at: expect.any(Date),
      })
    );

    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: expect.any(Number),
      })
    );
  });

  it('omits the maxAge when remember is false', async () => {
    const res = { cookie: jest.fn() } as any;

    await generateRefreshToken(userId, false, res, ip, userAgent);

    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/auth',
      })
    );

    const [, , options] = (res.cookie as jest.Mock).mock.calls[0];
    expect(options).not.toHaveProperty('maxAge');
  });
});
