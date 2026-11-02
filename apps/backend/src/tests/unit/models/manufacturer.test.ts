import Manufacturer from "../../../models/Manufacturer";
import { NotFoundError } from "../../../utils/errors";
import type { ManufacturerData, ManufacturerFilterData, PaginationData } from "../../../utils/schemas";
import { clearManufacturers, seedData, type TestData } from "../../db/seeder";

const manufacturerData: {[x: string]: ManufacturerData & TestData} = {
    'Test Manufacturer': {id: 0, name: 'Test Manufacturer', website: 'https://test-manufacturer.example'},
    'Test Manufacturer 2': {id: 0, name: 'Test Manufacturer 2', website: 'https://test-manufacturer-2.example'},
    'Test Manufacturer 3': {id: 0, name: 'Test Manufacturer 3'},
    'Deleted Manufacturer': {id: 0, name: 'Deleted Manufacturer', website: 'https://deleted-manufacturer.example', deleted_at: Date()}
};

beforeAll(async () => {
    await clearManufacturers();
    await seedData('manufacturers', manufacturerData);
});
afterAll(async () => {
    await clearManufacturers();
});

describe('Manufacturer get', function() {
    it('returns active manufacturer data', async () => {
        const data: PaginationData & ManufacturerFilterData = {limit: 50, offset: 0};
        const res = await Manufacturer.get(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(3);
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("name");
        expect(res[0]).toHaveProperty("website");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('paginates  manufacturers', async () => {
        const firstPage = await Manufacturer.get({limit: 2, offset: 0});
        const lastPage = await Manufacturer.get({limit: 2, offset: 2});

        expect(firstPage).toHaveLength(2);
        expect(lastPage).toHaveLength(1);
    });

    it('orders manufacturers', async () => {
        const ascending = await Manufacturer.get({limit: 2, offset: 0, orderBy: 'id'});
        const descending = await Manufacturer.get({limit: 2, offset: 0, orderBy: 'id', desc: 'true'});

        expect(ascending[0].id).toBeLessThan(ascending[1].id);
        expect(descending[0].id).toBeGreaterThan(descending[1].id);
    });

    it('filters by name and excludes an id', async () => {
        const manufacturer = manufacturerData['Test Manufacturer'];
        const filtered: PaginationData & ManufacturerFilterData = {limit: 50, offset: 0, search: 'Test Manufacturer 2'};
        const excluded: PaginationData & ManufacturerFilterData = {limit: 50, offset: 0, exclude: manufacturer.id.toString()};
        const searchResults = await Manufacturer.get(filtered);
        const excludeResults = await Manufacturer.get(excluded);

        expect(searchResults).toHaveLength(1);
        expect(searchResults[0].id).toEqual(manufacturerData['Test Manufacturer 2'].id);
        expect(excludeResults.some(row => row.id === manufacturer.id)).toBe(false);
    });
});

describe('Manufacturer getById', function() {
    it('returns manufacturer data', async () => {
        const manufacturer = manufacturerData['Test Manufacturer'];
        const res = await Manufacturer.getById(manufacturer.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject(manufacturer);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error if id does not exist or is soft-deleted', async () => {
        await expect(Manufacturer.getById(123)).rejects.toThrow(NotFoundError);
        await expect(Manufacturer.getById(manufacturerData['Deleted Manufacturer'].id)).rejects.toThrow(NotFoundError);
    });
});

describe('Manufacturer create', function() {
    it('creates manufacturer and returns its values', async () => {
        const newManufacturer: ManufacturerData = {name: 'New Manufacturer', website: 'https://new-manufacturer.example'};
        const res = await Manufacturer.create(newManufacturer);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        
        expect(res[0]).toMatchObject(newManufacturer);
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
});

describe('Manufacturer update', function() {
    it('updates manufacturer and returns its values', async () => {
        const manufacturer = manufacturerData['Test Manufacturer'];
        const updated: ManufacturerData = {name: 'Updated Manufacturer', website: 'https://updated-manufacturer.example'};
        const res = await Manufacturer.update(manufacturer.id, updated);

        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id", manufacturer.id);
        expect(res[0]).toMatchObject(updated);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error if id does not exist or is soft-deleted', async () => {
        const updated: ManufacturerData = {name: 'Missing Manufacturer'};
        await expect(Manufacturer.update(123, updated)).rejects.toThrow(NotFoundError);
        await expect(Manufacturer.update(manufacturerData['Deleted Manufacturer'].id, updated)).rejects.toThrow(NotFoundError);
    });
});

describe('Manufacturer delete and restore', function() {
    it('soft-deletes a manufacturer', async () => {
        const manufacturer = manufacturerData['Test Manufacturer 2'];
        const res = await Manufacturer.delete(manufacturer.id);

        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject(manufacturer);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
        await expect(Manufacturer.getById(manufacturer.id)).rejects.toThrow(NotFoundError);
    });

    it('restores a soft-deleted manufacturer', async () => {
        const manufacturer = manufacturerData['Test Manufacturer 2'];
        const res = await Manufacturer.restore(manufacturer.id);

        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject(manufacturer);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
        expect(await Manufacturer.getById(manufacturer.id)).toHaveLength(1);
    });

    it('throws error if deleting or restoring an invalid manufacturer', async () => {
        await expect(Manufacturer.delete(123)).rejects.toThrow(NotFoundError);
        await expect(Manufacturer.delete(manufacturerData['Deleted Manufacturer'].id)).rejects.toThrow(NotFoundError);
        await expect(Manufacturer.restore(123)).rejects.toThrow(NotFoundError);
        await expect(Manufacturer.restore(manufacturerData['Test Manufacturer 2'].id)).rejects.toThrow(NotFoundError);
    });
});