import RefreshToken from "../../../models/RefreshToken";
import type { RefreshTokenData } from "../../../utils/schemas";
import { clearUsers, seedUsers, type UserDataTest } from "../../db/seeder";

const userData: {[x: string]: UserDataTest} = {
    'Refresh Token User': {id: 0, name: 'Refresh Token User', email: 'refresh-token-user@test.com', passwd: 'refresh-token-password', role: 'reader'}
};

beforeAll(async () => {
    await clearUsers();
    await seedUsers(userData);
});
afterAll(async () => {
    await clearUsers();
});

function tokenData(tokenHash: string): RefreshTokenData {
    return {
        user_id: userData['Refresh Token User'].id,
        token_hash: tokenHash,
        remember: true,
        user_agent: 'Jest test agent',
        ip_address: '127.0.0.1',
        expires_at: new Date('2030-01-01T00:00:00.000Z')
    };
}

describe('RefreshToken create', function() {
    it('creates a refresh token and returns its values', async () => {
        const data = tokenData('a'.repeat(64));
        const res = await RefreshToken.create(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].user_id).toEqual(data.user_id);
        expect(res[0].token_hash).toEqual(data.token_hash);
        expect(res[0].remember).toEqual(data.remember);
        expect(res[0].user_agent).toEqual(data.user_agent);
        expect(res[0].ip_address).toEqual(data.ip_address);
        expect(new Date(res[0].expires_at).toISOString()).toEqual(data.expires_at.toISOString());
    });
});

describe('RefreshToken findByToken', function() {
    it('returns the token matching its hash', async () => {
        const data = tokenData('b'.repeat(64));
        await RefreshToken.create(data);
        const res = await RefreshToken.findByToken(data.token_hash);

        expect(res).toHaveLength(1);
        expect(res[0].user_id).toEqual(data.user_id);
        expect(res[0].token_hash).toEqual(data.token_hash);
    });

    it('returns an empty array when the hash is not found', async () => {
        const res = await RefreshToken.findByToken('c'.repeat(64));

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(0);
    });
});

describe('RefreshToken deleteByToken', function() {
    it('deletes and returns the token matching its hash', async () => {
        const data = tokenData('d'.repeat(64));
        await RefreshToken.create(data);
        const res = await RefreshToken.deleteByToken(data.token_hash);

        expect(res).toHaveLength(1);
        expect(res[0].token_hash).toEqual(data.token_hash);
        expect(await RefreshToken.findByToken(data.token_hash)).toHaveLength(0);
    });

    it('returns an empty array when the hash is not found', async () => {
        const res = await RefreshToken.deleteByToken('e'.repeat(64));

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(0);
    });
});