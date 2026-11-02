import User from "../../../models/User";
import { NotFoundError, UserNotFoundError } from "../../../utils/errors";
import type { UserData } from "../../../utils/schemas";
import { clearUsers, seedUsers, type UserDataTest } from "../../db/seeder";

const userData: {[x: string]: UserDataTest} = {
    'Admin User': {id: 0, name: 'Admin User', email: 'admin.user@test.com', passwd: 'admin-password', role: 'admin'},
    'Technician User': {id: 0, name: 'Technician User', email: 'technician.user@test.com', passwd: 'technician-password', role: 'technician'},
    'Reader User': {id: 0, name: 'Reader User', email: 'reader.user@test.com', passwd: 'reader-password', role: 'reader'},
    'Deleted User': {id: 0, name: 'Deleted User', email: 'deleted.user@test.com', passwd: 'deleted-password', role: 'reader', deleted_at: Date()}
};

beforeAll(async () => {
    await clearUsers();
    await seedUsers(userData);
});
afterAll(async () => {
    await clearUsers();
});

describe('User get', function() {
    it('returns user data without password or timestamps', async () => {
        const res = await User.get({limit: 50, offset: 0});

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(3);
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("name");
        expect(res[0]).toHaveProperty("email");
        expect(res[0]).toHaveProperty("role");
        expect(res[0]).not.toHaveProperty("passwd");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('paginates users', async () => {
        const firstPage = await User.get({limit: 2, offset: 0});
        const lastPage = await User.get({limit: 2, offset: 2});

        expect(firstPage).toHaveLength(2);
        expect(lastPage).toHaveLength(1);
    });

    it('orders users', async () => {
        const ascending = await User.get({limit: 2, offset: 0, orderBy: 'id'});
        const descending = await User.get({limit: 2, offset: 0, orderBy: 'id', desc: 'true'});

        expect(ascending[0].id).toBeLessThan(ascending[1].id);
        expect(descending[0].id).toBeGreaterThan(descending[1].id);
    });

    it('filters users by name', async () => {
        const user = userData['Technician User'];
        const res = await User.get({limit: 50, offset: 0, search: 'Technician'});

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(user.id);
        expect(res[0].name).toEqual(user.name);
        expect(res[0].email).toEqual(user.email);
    });
});

describe('User getById', function() {
    it('returns user data', async () => {
        const user = userData['Admin User'];
        const res = await User.getById(user.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(user.id);
        expect(res[0].name).toEqual(user.name);
        expect(res[0].email).toEqual(user.email);
        expect(res[0].role).toEqual(user.role);
        expect(res[0]).not.toHaveProperty("passwd");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error if id does not exist', async () => {
        await expect(User.getById(123)).rejects.toThrow(NotFoundError);
    });

    it('throws error if user was soft-deleted', async () => {
        const user = userData['Deleted User'];
        await expect(User.getById(user.id)).rejects.toThrow(NotFoundError);
    });
});

describe('User create', function() {
    it('creates user and returns the public values', async () => {
        const newUser: UserData = {name: 'New User', email: 'new.user@test.com', passwd: 'new-user-password'};
        const res = await User.create(newUser);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].name).toEqual(newUser.name);
        expect(res[0].email).toEqual(newUser.email);
        expect(res[0].role).toEqual('reader');
        expect(res[0]).not.toHaveProperty("passwd");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
});

describe('User updates', function() {
    it('updates role and returns user data', async () => {
        const user = userData['Reader User'];
        const res = await User.updateRole(user.id, 'technician');

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(user.id);
        expect(res[0].role).toEqual('technician');
        expect(res[0]).not.toHaveProperty("passwd");
    });

    it('updates name and returns user data', async () => {
        const user = userData['Reader User'];
        const res = await User.updateName(user.id, 'Updated Reader');

        expect(res).toHaveLength(1);
        expect(res[0].name).toEqual('Updated Reader');
    });

    it('updates email and returns user data', async () => {
        const user = userData['Reader User'];
        const res = await User.updateEmail(user.id, 'updated.reader@test.com');

        expect(res).toHaveLength(1);
        expect(res[0].email).toEqual('updated.reader@test.com');
    });

    it('updates password', async () => {
        const user = userData['Reader User'];
        const res = await User.updatePasswd(user.id, 'updated-password-hash');
        const login = await User.login('updated.reader@test.com');

        expect(res).toHaveLength(1);
        expect(res[0]).not.toHaveProperty("passwd");
        expect(login[0].passwd).toEqual('updated-password-hash');
    });

    it('throws error when updating a missing or deleted user', async () => {
        await expect(User.updateRole(123, 'reader')).rejects.toThrow(NotFoundError);
        await expect(User.updateName(userData['Deleted User'].id, 'Updated')).rejects.toThrow(NotFoundError);
    });
});

describe('User delete and restore', function() {
    it('soft-deletes a user and returns public data', async () => {
        const user = userData['Technician User'];
        const res = await User.delete(user.id);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(user.id);
        expect(res[0].name).toEqual(user.name);
        expect(res[0]).not.toHaveProperty("deleted_at");
        await expect(User.getById(user.id)).rejects.toThrow(NotFoundError);
    });

    it('restores a soft-deleted user', async () => {
        const user = userData['Technician User'];
        const res = await User.restore(user.id);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(user.id);
        expect(res[0].name).toEqual(user.name);
        expect(res[0]).not.toHaveProperty("deleted_at");
        expect(await User.getById(user.id)).toHaveLength(1);
    });

    it('throws error when deleting or restoring an invalid user', async () => {
        await expect(User.delete(123)).rejects.toThrow(NotFoundError);
        await expect(User.delete(userData['Deleted User'].id)).rejects.toThrow(NotFoundError);
        await expect(User.restore(123)).rejects.toThrow(NotFoundError);
        await expect(User.restore(userData['Admin User'].id)).rejects.toThrow(NotFoundError);
    });
});

describe('User login and password checks', function() {
    it('returns credentials for an active user', async () => {
        const user = userData['Admin User'];
        const res = await User.login(user.email);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(user.id);
        expect(res[0].name).toEqual(user.name);
        expect(res[0].email).toEqual(user.email);
        expect(res[0].role).toEqual(user.role);
        expect(res[0].passwd).not.toEqual(user.passwd);
    });

    it('throws when the user does not exist or is deleted', async () => {
        await expect(User.login('missing.user@test.com')).rejects.toThrow(UserNotFoundError);
        await expect(User.login(userData['Deleted User'].email)).rejects.toThrow(UserNotFoundError);
    });

    it('checks whether an active email exists', async () => {
        expect(await User.exists(userData['Admin User'].email)).toBe(true);
        expect(await User.exists(userData['Deleted User'].email)).toBe(false);
        expect(await User.exists('missing.user@test.com')).toBe(false);
    });

    it('compares passwords and throws for a missing user', async () => {
        const user = userData['Admin User'];

        await expect(User.hasEqualPasswd(user.id, user.passwd)).resolves.toBe(true);
        await expect(User.hasEqualPasswd(user.id, 'incorrect-password')).resolves.toBe(false);
        await expect(User.hasEqualPasswd(123, 'any-password')).rejects.toThrow(UserNotFoundError);
        await expect(User.hasEqualPasswd(userData['Deleted User'].id, 'deleted-password')).rejects.toThrow(UserNotFoundError);
    });
});