import Component from "../../../models/Component";
import { NotFoundError } from "../../../utils/errors";
import type { CategoryData, ComponentData, ComponentFilterData, ComponentLocationData, LocationData, ManufacturerData, PaginationData } from "../../../utils/schemas";
import { clearCategories, clearComponents, clearLocations, clearManufacturers, seedComponentLocations, seedData, type TestData } from "../../db/seeder";

const categoryData: {[x: string]: CategoryData & TestData} = {
    'Category 1': {id: 0, name: 'Category 1', path: 'Category_1'},
    'Category 2': {id: 0, name: 'Category 2', path: 'Category_1.Category_2'},
    'Category 3': {id: 0, name: 'Category 3', path: 'Category_3'}
};
const manufacturerData: {[x: string]: ManufacturerData & TestData} = {
    'Manufacturer 1': {id: 0, name: 'Manufacturer 1', website: 'https://maker-one.example'},
    'Manufacturer 2': {id: 0, name: 'Manufacturer 2', website: 'https://maker-two.example'}
};
const locationData: {[x: string]: LocationData & TestData} = {
    'Location 1': {id: 0, name: 'Location 1', description: 'First test location', path: 'Test_Location_1'},
    'Location 2': {id: 0, name: 'Location 2', path: 'Test_Location_2'}
};
const componentData: {[x: string]: ComponentData & TestData} = {
    'Component 1': {id: 0, sku: 'CMP-001', name: 'Component 1', description: 'First test component', category_id: 0, manufacturer_id: 0, stock: 10, stock_min: 2, unit_cost: 5, datasheet_url: 'https://example.test', image_url: 'https://example.test/image', notes: 'test component'},
    'Component 2': {id: 0, sku: 'CMP-002', name: 'Component 2', description: 'Second test component', category_id: 0, manufacturer_id: 0, stock: 20, stock_min: 3, unit_cost: 8},
    'Component 3': {id: 0, sku: 'CMP-003', name: 'Component 3', category_id: 0, manufacturer_id: 0, stock: 5},
    'Deleted Component': {id: 0, sku: 'CMP-004', name: 'Deleted Component', category_id: 0, manufacturer_id: 0, stock: 15, deleted_at: new Date().toISOString()}
};
const componentLocationData: {[x: string]: ComponentLocationData} = {
    'CL1': {component_id: 0, location_id: 0, amount: 5},
    'CL2': {component_id: 0, location_id: 0, amount: 10}
};

beforeAll(async () => {
    await clearComponents();
    await clearCategories();
    await clearManufacturers();
    await clearLocations();
    await seedData('component_categories', categoryData);
    await seedData('manufacturers', manufacturerData);
    await seedData('locations', locationData);

    componentData['Component 1'].category_id = categoryData['Category 2'].id;
    componentData['Component 1'].manufacturer_id = manufacturerData['Manufacturer 1'].id;
    componentData['Component 2'].category_id = categoryData['Category 3'].id;
    componentData['Component 2'].manufacturer_id = manufacturerData['Manufacturer 2'].id;
    componentData['Component 3'].category_id = categoryData['Category 2'].id;
    componentData['Component 3'].manufacturer_id = manufacturerData['Manufacturer 1'].id;
    componentData['Deleted Component'].category_id = categoryData['Category 2'].id;
    componentData['Deleted Component'].manufacturer_id = manufacturerData['Manufacturer 1'].id;
    await seedData('components', componentData);

    componentLocationData['CL1'].component_id = componentData['Component 1'].id;
    componentLocationData['CL1'].location_id = locationData['Location 1'].id;
    componentLocationData['CL2'].component_id = componentData['Component 1'].id;
    componentLocationData['CL2'].location_id = locationData['Location 2'].id;
    await seedComponentLocations(componentLocationData);
});
afterAll(async () => {
    await clearComponents();
    await clearCategories();
    await clearManufacturers();
    await clearLocations();
});

describe('Component get', function() {
    it('returns active component data with joined category and manufacturer', async () => {
        const data: PaginationData & ComponentFilterData = {limit: 50, offset: 0};
        const res = await Component.get(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(3);
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("sku");
        expect(res[0]).toHaveProperty("name");
        expect(res[0]).toHaveProperty("category_id");
        expect(res[0]).toHaveProperty("category");
        expect(res[0]).toHaveProperty("manufacturer_id");
        expect(res[0]).toHaveProperty("manufacturer");
        expect(res[0]).toHaveProperty("stock");
        expect(res[0]).toHaveProperty("stock_min");
        expect(res[0]).toHaveProperty("datasheet_url");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("notes");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('paginates components', async () => {
        const firstPage = await Component.get({limit: 2, offset: 0});
        const lastPage = await Component.get({limit: 2, offset: 2});

        expect(firstPage).toHaveLength(2);
        expect(lastPage).toHaveLength(1);
    });

    it('paginates and orders components', async () => {
        const ascending = await Component.get({limit: 2, offset: 0, orderBy: 'stock'});
        const descending = await Component.get({limit: 2, offset: 0, orderBy: 'stock', desc: 'true'});

        expect(ascending[0].stock).toBeLessThan(ascending[1].stock);
        expect(descending[0].stock).toBeGreaterThan(descending[1].stock);
    });

    it('filters by name, category, and manufacturer', async () => {
        const component = componentData['Component 1'];
        const searchResults = await Component.get({limit: 50, offset: 0, search: 'Component 2'});
        const categoryResults = await Component.get({limit: 50, offset: 0, category: categoryData['Category 1'].id});
        const manufacturerResults = await Component.get({limit: 50, offset: 0, manufacturer: manufacturerData['Manufacturer 1'].id});

        expect(searchResults).toHaveLength(1);
        expect(searchResults[0].id).toEqual(componentData['Component 2'].id);
        expect(categoryResults.map(row => row.id)).toContain(component.id);
        expect(manufacturerResults.map(row => row.id)).toContain(component.id);
        expect(manufacturerResults.map(row => row.id)).not.toContain(componentData['Component 2'].id);
    });
});

describe('Component getById', function() {
    it('returns component data with manufacturer details', async () => {
        const component = componentData['Component 1'];
        const res = await Component.getById(component.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject({...component, unit_cost: component.unit_cost?.toString()});
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error if id does not exist or is soft-deleted', async () => {
        await expect(Component.getById(123)).rejects.toThrow(NotFoundError);
        await expect(Component.getById(componentData['Deleted Component'].id)).rejects.toThrow(NotFoundError);
    });
});

describe('Component create and update', function() {
    it('creates component and returns its public values', async () => {
        const newComponent: ComponentData = {
            sku: 'CMP-NEW',
            name: 'New Component',
            description: 'Created for model tests',
            category_id: categoryData['Category 2'].id,
            manufacturer_id: manufacturerData['Manufacturer 1'].id,
            stock: 4,
            stock_min: 1,
            unit_cost: 12
        };
        const res = await Component.create(newComponent);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject({...newComponent, unit_cost: newComponent.unit_cost?.toString()});
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("datasheet_url");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("notes");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('updates component values', async () => {
        const component = componentData['Component 1'];
        const updated: ComponentData = {
            sku: component.sku,
            name: 'Updated Component',
            description: 'Updated test component',
            category_id: component.category_id,
            manufacturer_id: component.manufacturer_id,
            stock: 25,
            stock_min: 4,
            unit_cost: 15
        };
        const res = await Component.update(component.id, updated);

        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject({...updated, unit_cost: updated.unit_cost?.toString()});
        expect(res[0]).toHaveProperty("id", component.id);
        expect(res[0]).toHaveProperty("datasheet_url");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("notes");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error when updating a missing or deleted component', async () => {
        const updated: ComponentData = {
            sku: 'CMP-MISSING',
            name: 'Missing Component',
            category_id: categoryData['Category 2'].id,
            manufacturer_id: manufacturerData['Manufacturer 1'].id
        };
        await expect(Component.update(123, updated)).rejects.toThrow(NotFoundError);
        await expect(Component.update(componentData['Deleted Component'].id, updated)).rejects.toThrow(NotFoundError);
    });
});

describe('Component delete and restore', function() {
    it('soft-deletes a component', async () => {
        const component = componentData['Component 3'];
        const res = await Component.delete(component.id);

        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject({...component, unit_cost: "0"});
        expect(res[0]).toHaveProperty("stock_min");
        expect(res[0]).toHaveProperty("datasheet_url");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("notes");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
        await expect(Component.getById(component.id)).rejects.toThrow(NotFoundError);
    });

    it('restores a soft-deleted component', async () => {
        const component = componentData['Component 3'];
        const res = await Component.restore(component.id);

        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject({...component, unit_cost: "0"});
        expect(res[0]).toHaveProperty("stock_min");
        expect(res[0]).toHaveProperty("datasheet_url");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("notes");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
        expect(await Component.getById(component.id)).toHaveLength(1);
    });

    it('throws error when deleting or restoring an invalid component', async () => {
        await expect(Component.delete(123)).rejects.toThrow(NotFoundError);
        await expect(Component.delete(componentData['Deleted Component'].id)).rejects.toThrow(NotFoundError);
        await expect(Component.restore(123)).rejects.toThrow(NotFoundError);
        await expect(Component.restore(componentData['Component 1'].id)).rejects.toThrow(NotFoundError);
    });
});

describe('Component location stock', function() {
    it('returns stock locations and filters by location id', async () => {
        const component = componentData['Component 1'];
        const allLocations = await Component.getLocations({component_id: component.id});
        const location = await Component.getLocations({component_id: component.id, location_id: locationData['Location 1'].id});

        expect(allLocations).toHaveLength(2);
        expect(allLocations[0]).toHaveProperty("location_name");
        expect(allLocations[0]).toHaveProperty("location_route");
        expect(location).toHaveLength(1);
        expect(location[0].location_id).toEqual(locationData['Location 1'].id);
    });

    it('returns empty array if no stock location exists', async () => {
        const locations = await Component.getLocations({component_id: componentData['Component 2'].id});
        expect(locations).toHaveLength(0);
    });

    it('returns all locations in amount order', async () => {
        const locations = await Component.getAllLocations(componentData['Component 1'].id);

        expect(locations).toHaveLength(2);
        expect(locations[0].amount).toBeGreaterThan(locations[1].amount);
        expect(locations[0]).toHaveProperty("location_description");
        expect(await Component.getAllLocations(componentData['Component 2'].id)).toHaveLength(0);
    });

    it('adds, updates, and removes stock at a location', async () => {
        const component1Id = componentData['Component 1'].id;
        const component2Id = componentData['Component 2'].id;
        const location1Id = locationData['Location 1'].id;

        const updated1 = await Component.updateQuantity(component1Id, location1Id, 12);

        const added2 = await Component.addToLocation(component2Id, location1Id, 3);
        const updated2 = await Component.updateQuantity(component2Id, location1Id, 7);
        const removed2 = await Component.removeFromLocation(component2Id, location1Id);

        expect(updated1[0].amount).toEqual(12);
        expect(added2[0].amount).toEqual(3);
        expect(updated2[0].amount).toEqual(7);
        expect(removed2[0].amount).toEqual(7);
        await expect(Component.updateQuantity(component2Id, location1Id, 1)).rejects.toThrow(NotFoundError);
        await expect(Component.removeFromLocation(component2Id, location1Id)).rejects.toThrow(NotFoundError);
    });
});