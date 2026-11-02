import Location from "../../../models/Location";
import { NotFoundError } from "../../../utils/errors";
import type { CategoryData, ComponentData, ComponentLocationData, LocationData, LocationFilterData, ManufacturerData, PaginationData } from "../../../utils/schemas";
import { clearCategories, clearComponents, clearLocations, clearManufacturers, seedComponentLocations, seedData, type TestData } from "../../db/seeder";

const locationsData: {[x: string]: LocationData & TestData} = {
    'Test Location 1': {id: 0, name: 'Test Location 1', description: 'loc 1', path: 'Test_Location_1'},
    'Test Location 2': {id: 0, name: 'Test Location 2', description: 'loc 2', path: 'Test_Location_1.Test_Location_2'},
    'Test Location 3': {id: 0, name: 'Test Location 3', description: 'loc 3', path: 'Test_Location_3'},
    'Deleted Location': {id: 0, name: 'Deleted Location', path: 'Deleted_Location', deleted_at: Date()}
};
const categoryData: {[x: string]: CategoryData & TestData} = {
    'Test Category': {id: 0, name: 'Test Category', path: 'Component_Category'}
};
const manufacturersData: {[x: string]: ManufacturerData & TestData} = {
    'Test Manufacturer': {id: 0, name: 'Test Manufacturer', website: 'https://component.example.test'}
};
const componentsData: {[x: string]: ComponentData & TestData} = {
    'Test Component 1': {id: 0, sku: '001', name: 'Test Component 1', category_id: 0, manufacturer_id: 0, stock: 10},
    'Deleted Component': {id: 0, sku: '004', name: 'Deleted Component', category_id: 0, manufacturer_id: 0, stock: 20, deleted_at: Date()},
};
const componentLocationData: {[x: string]: ComponentLocationData} = {
    'CL1': {component_id: 0, location_id: 0, amount: 10}
};
beforeAll(async () => {
    await clearLocations();
    await seedData('component_categories', categoryData);
    await seedData('locations', locationsData);
    await seedData('manufacturers', manufacturersData);

    componentsData['Test Component 1'].category_id = categoryData['Test Category'].id;
    componentsData['Test Component 1'].manufacturer_id = manufacturersData['Test Manufacturer'].id;
    componentsData['Deleted Component'].category_id = categoryData['Test Category'].id;
    componentsData['Deleted Component'].manufacturer_id = manufacturersData['Test Manufacturer'].id;
    await seedData('components', componentsData);

    componentLocationData['CL1'].component_id = componentsData['Test Component 1'].id;
    componentLocationData['CL1'].location_id = locationsData['Test Location 1'].id;
    await seedComponentLocations(componentLocationData);
});
afterAll(async () => {
    await clearComponents();
    await clearCategories();
    await clearManufacturers();
    await clearLocations();
});

describe('Location get', function() {
    it('returns all locations', async () => {
        const data: PaginationData & LocationFilterData = {limit: 50, offset: 0};
        const res = await Location.get(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(3);
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("name");
        expect(res[0]).toHaveProperty("path");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('paginates locations', async () => {
        const firstPage = await Location.get({limit: 2, offset: 0, orderBy: 'id'});
        const lastPage = await Location.get({limit: 2, offset: 2, orderBy: 'id', desc: 'true'});

        expect(firstPage).toHaveLength(2);
        expect(lastPage).toHaveLength(1);
    });

    it('orders locations', async () => {
        const ascending = await Location.get({limit: 2, offset: 0, orderBy: 'id'});
        const descending = await Location.get({limit: 2, offset: 0, orderBy: 'id', desc: 'true'});

        expect(ascending[0].id).toBeLessThan(ascending[1].id);
        expect(descending[0].id).toBeGreaterThan(descending[1].id);
    });

    it('filters by name and excludes an id', async () => {
        const filtered: PaginationData & LocationFilterData = {limit: 50, offset: 0, search: 'Test Location 3'};
        const excluded: PaginationData & LocationFilterData = {limit: 50, offset: 0, exclude: locationsData['Test Location 1'].id.toString()};
        const searchResults = await Location.get(filtered);
        const excludeResults = await Location.get(excluded);

        expect(searchResults).toHaveLength(1);
        expect(searchResults[0].id).toEqual(locationsData['Test Location 3'].id);
        expect(excludeResults.some(location => location.id === locationsData['Test Location 1'].id)).toBe(false);
    });
});

describe('Location getById', function() {
    it('returns location data', async () => {
        const location = locationsData['Test Location 1'];
        const res = await Location.getById(location.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(location.id);
        expect(res[0].name).toEqual(location.name);
        expect(res[0].description).toEqual(location.description);
        expect(res[0].path).toEqual(location.path);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error if id does not exist or is soft-deleted', async () => {
        await expect(Location.getById(123)).rejects.toThrow(NotFoundError);
        await expect(Location.getById(locationsData['Deleted Location'].id)).rejects.toThrow(NotFoundError);
    });
});

describe('Location create', function() {
    it('creates location and returns its values', async () => {
        const newLocation: LocationData = {name: 'New Location', description: 'New test location', path: 'New_Location'};
        const res = await Location.create(newLocation);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].name).toEqual(newLocation.name);
        expect(res[0].description).toEqual(newLocation.description);
        expect(res[0].path).toEqual(newLocation.path);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });
});

describe('Location update', function() {
    it('updates location and the paths of its children', async () => {
        const location = locationsData['Test Location 1'];
        const newLocation: LocationData = {name: 'Renamed Area', description: 'Renamed test area', path: 'Renamed_Area'};
        const res = await Location.update(location.id, newLocation);
        const child = await Location.getById(locationsData['Test Location 2'].id);

        expect(res).toHaveLength(1);
        expect(res[0].name).toEqual(newLocation.name);
        expect(res[0].path).toEqual(newLocation.path);
        expect(res[0].old_path).toEqual(location.path);
        expect(child[0].path).toEqual('Renamed_Area.Test_Location_2');
    });

    it('throws error if id does not exist or is soft-deleted', async () => {
        const newLocation: LocationData = {name: 'Missing', path: 'Missing'};
        await expect(Location.update(123, newLocation)).rejects.toThrow(NotFoundError);
        await expect(Location.update(locationsData['Deleted Location'].id, newLocation)).rejects.toThrow(NotFoundError);
    });
});

describe('Location delete and restore', function() {
    it('soft-deletes a location and its children', async () => {
        const location = locationsData['Test Location 1'];
        const res = await Location.delete(location.id);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(location.id);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
        await expect(Location.getById(location.id)).rejects.toThrow(NotFoundError);
        await expect(Location.getById(locationsData['Test Location 2'].id)).rejects.toThrow(NotFoundError);
    });

    it('restores a location and its children', async () => {
        const location = locationsData['Test Location 1'];
        const res = await Location.restore(location.id);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(location.id);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
        expect((await Location.getById(location.id))).toHaveLength(1);
        expect((await Location.getById(locationsData['Test Location 2'].id))).toHaveLength(1);
    });

    it('throws error if deleting or restoring an invalid location', async () => {
        await expect(Location.delete(123)).rejects.toThrow(NotFoundError);
        await expect(Location.delete(locationsData['Deleted Location'].id)).rejects.toThrow(NotFoundError);
        await expect(Location.restore(123)).rejects.toThrow(NotFoundError);
        await expect(Location.restore(locationsData['Test Location 1'].id)).rejects.toThrow(NotFoundError);
    });
});

describe('Location getComponents', function() {
    it('returns a list of components in location', async () => {
        const res = await Location.getComponents(locationsData['Test Location 1'].id);

        expect(Array.isArray(res)).toBe(true);
        expect(res[0].component_id).toEqual(componentsData['Test Component 1'].id);
    });

    it('returns an empty array when the location has no components', async () => {
        const res = await Location.getComponents(locationsData['Test Location 3'].id);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(0);
    });
});