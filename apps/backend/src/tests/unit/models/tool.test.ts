import Tool from "../../../models/Tool";
import { NotFoundError } from "../../../utils/errors";
import type { LocationData, ManufacturerData, PaginationData, ToolData, ToolFilterData } from "../../../utils/schemas";
import { clearLocations, clearManufacturers, clearToolCategories, clearTools, seedData, type TestData } from "../../db/seeder";
import type { CategoryData } from "../../../utils/schemas";

const manufacturerData: {[x: string]: ManufacturerData & TestData} = {
    'Manufacturer 1': {id: 0, name: 'Tool Manufacturer 1', website: 'https://tool-maker-one.example'},
    'Manufacturer 2': {id: 0, name: 'Tool Manufacturer 2', website: 'https://tool-maker-two.example'}
};
const categoryData: {[x: string]: CategoryData & TestData} = {
    'Hand Tools': {id: 0, name: 'Hand Tools', path: 'Test_Hand_Tools'},
    'Measurement Tools': {id: 0, name: 'Measurement Tools', path: 'Test_Measurement_Tools'}
};
const locationData: {[x: string]: LocationData & TestData} = {
    'Workshop': {id: 0, name: 'Workshop', description: 'Tool test workshop', path: 'Tool_Test_Workshop'},
    'Lab': {id: 0, name: 'Lab', description: 'Tool test lab', path: 'Tool_Test_Lab'}
};
const toolData: {[x: string]: ToolData & TestData} = {
    'Test Tool 1': {id: 0, sku: 'TOL-001', name: 'Test Tool 1', manufacturer_id: 0, model: 'Model A', category_id: 0, location_id: 0, state: 'available', notes: 'First test tool'},
    'Test Tool 2': {id: 0, sku: 'TOL-002', name: 'Test Tool 2', manufacturer_id: 0, model: 'Model B', category_id: 0, location_id: 0, state: 'maintenance'},
    'Test Tool 3': {id: 0, sku: 'TOL-003', name: 'Test Tool 3', manufacturer_id: 0, model: 'Model C', category_id: 0, location_id: 0, state: 'in_use'},
    'Deleted Tool': {id: 0, sku: 'TOL-004', name: 'Deleted Tool', manufacturer_id: 0, model: 'Model D', category_id: 0, location_id: 0, state: 'disposed', deleted_at: new Date().toISOString()}
};

beforeAll(async () => {
    await clearTools();
    await clearManufacturers();
    await clearToolCategories();
    await clearLocations();
    await seedData('manufacturers', manufacturerData);
    await seedData('tool_categories', categoryData);
    await seedData('locations', locationData);

    toolData['Test Tool 1'].manufacturer_id = manufacturerData['Manufacturer 1'].id;
    toolData['Test Tool 1'].category_id = categoryData['Hand Tools'].id;
    toolData['Test Tool 1'].location_id = locationData['Workshop'].id;
    toolData['Test Tool 2'].manufacturer_id = manufacturerData['Manufacturer 2'].id;
    toolData['Test Tool 2'].category_id = categoryData['Measurement Tools'].id;
    toolData['Test Tool 2'].location_id = locationData['Lab'].id;
    toolData['Test Tool 3'].manufacturer_id = manufacturerData['Manufacturer 1'].id;
    toolData['Test Tool 3'].category_id = categoryData['Hand Tools'].id;
    toolData['Test Tool 3'].location_id = locationData['Workshop'].id;
    toolData['Deleted Tool'].manufacturer_id = manufacturerData['Manufacturer 1'].id;
    toolData['Deleted Tool'].category_id = categoryData['Hand Tools'].id;
    toolData['Deleted Tool'].location_id = locationData['Workshop'].id;
    await seedData('tools', toolData);
});
afterAll(async () => {
    await clearTools();
    await clearManufacturers();
    await clearToolCategories();
    await clearLocations();
});

describe('Tool get', function() {
    it('returns active tools with joined details', async () => {
        const data: PaginationData & ToolFilterData = {limit: 50, offset: 0};
        const res = await Tool.get(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(3);
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("sku");
        expect(res[0]).toHaveProperty("name");
        expect(res[0]).toHaveProperty("manufacturer_id");
        expect(res[0]).toHaveProperty("manufacturer");
        expect(res[0]).toHaveProperty("model");
        expect(res[0]).toHaveProperty("serial_number");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("manual_url");
        expect(res[0]).toHaveProperty("category_id");
        expect(res[0]).toHaveProperty("location_id");
        expect(res[0]).toHaveProperty("state");
        expect(res[0]).toHaveProperty("acquisition_date");
        expect(res[0]).toHaveProperty("notes");
        expect(res[0]).toHaveProperty("category");
        expect(res[0]).toHaveProperty("location");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('paginates and orders tools', async () => {
        const firstPage = await Tool.get({limit: 2, offset: 0});
        const lastPage = await Tool.get({limit: 2, offset: 2});

        expect(firstPage).toHaveLength(2);
        expect(lastPage).toHaveLength(1);
    });

    it('paginates and orders tools', async () => {
        const ascending = await Tool.get({limit: 2, offset: 0, orderBy: 'id'});
        const descending = await Tool.get({limit: 2, offset: 0, orderBy: 'name', desc: 'true'});

        expect(ascending[0].id).toBeLessThan(ascending[1].id);
        expect(descending[0].id).toBeGreaterThan(descending[1].id);
    });

    it('filters by name, category, manufacturer, and state', async () => {
        const tool = toolData['Test Tool 1'];
        const searchResults = await Tool.get({limit: 50, offset: 0, search: 'Test Tool 2'});
        const categoryResults = await Tool.get({limit: 50, offset: 0, category: categoryData['Hand Tools'].id});
        const manufacturerResults = await Tool.get({limit: 50, offset: 0, manufacturer: manufacturerData['Manufacturer 1'].id});
        const stateResults = await Tool.get({limit: 50, offset: 0, state: 'maintenance'});

        expect(searchResults).toHaveLength(1);
        expect(searchResults[0].id).toEqual(toolData['Test Tool 2'].id);
        expect(categoryResults.map(row => row.id)).toContain(tool.id);
        expect(manufacturerResults.map(row => row.id)).toContain(tool.id);
        expect(stateResults).toHaveLength(1);
        expect(stateResults[0].id).toEqual(toolData['Test Tool 2'].id);
    });
});

describe('Tool getById', function() {
    it('returns tool data with location details', async () => {
        const tool = toolData['Test Tool 1'];
        const res = await Tool.getById(tool.id);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(tool.id);
        expect(res[0].name).toEqual(tool.name);
        expect(res[0].manufacturer).toEqual(manufacturerData['Manufacturer 1'].name);
        expect(res[0].category).toEqual(categoryData['Hand Tools'].path);
        expect(res[0].location_name).toEqual(locationData['Workshop'].name);
        expect(res[0].location_route).toEqual(locationData['Workshop'].path);
        expect(res[0].location_description).toEqual(locationData['Workshop'].description);
        expect(res[0]).toHaveProperty("sku");
        expect(res[0]).toHaveProperty("manufacturer_id");
        expect(res[0]).toHaveProperty("model");
        expect(res[0]).toHaveProperty("serial_number");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("manual_url");
        expect(res[0]).toHaveProperty("category_id");
        expect(res[0]).toHaveProperty("location_id");
        expect(res[0]).toHaveProperty("state");
        expect(res[0]).toHaveProperty("acquisition_date");
        expect(res[0]).toHaveProperty("notes");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error if id does not exist or is soft-deleted', async () => {
        await expect(Tool.getById(123)).rejects.toThrow(NotFoundError);
        await expect(Tool.getById(toolData['Deleted Tool'].id)).rejects.toThrow(NotFoundError);
    });
});

describe('Tool create and update', function() {
    it('creates tool and returns its values', async () => {
        const newTool: ToolData = {
            sku: 'TOL-NEW',
            name: 'New Tool',
            manufacturer_id: manufacturerData['Manufacturer 1'].id,
            model: 'New Model',
            category_id: categoryData['Hand Tools'].id,
            location_id: locationData['Workshop'].id,
            state: 'available'
        };
        const res = await Tool.create(newTool);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].sku).toEqual(newTool.sku);
        expect(res[0].name).toEqual(newTool.name);
        expect(res[0].model).toEqual(newTool.model);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('updates tool values', async () => {
        const tool = toolData['Test Tool 1'];
        const updated: ToolData = {
            ...tool,
            name: 'Updated Tool',
            model: 'Updated Model',
            state: 'maintenance'
        };
        const res = await Tool.update(tool.id, updated);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(tool.id);
        expect(res[0].name).toEqual(updated.name);
        expect(res[0].model).toEqual(updated.model);
        expect(res[0].state).toEqual(updated.state);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error when updating a missing or deleted tool', async () => {
        const updated: ToolData = {...toolData['Test Tool 1'], sku: 'TOL-MISSING', name: 'Missing Tool'};
        await expect(Tool.update(123, updated)).rejects.toThrow(NotFoundError);
        await expect(Tool.update(toolData['Deleted Tool'].id, updated)).rejects.toThrow(NotFoundError);
    });
});

describe('Tool delete and restore', function() {
    it('soft-deletes a tool', async () => {
        const tool = toolData['Test Tool 3'];
        const res = await Tool.delete(tool.id);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(tool.id);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
        await expect(Tool.getById(tool.id)).rejects.toThrow(NotFoundError);
    });

    it('restores a tool', async () => {
        const tool = toolData['Test Tool 3'];
        const res = await Tool.restore(tool.id);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(tool.id);
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
        expect(await Tool.getById(tool.id)).toHaveLength(1);
    });

    it('throws error when deleting or restoring an invalid tool', async () => {
        await expect(Tool.delete(123)).rejects.toThrow(NotFoundError);
        await expect(Tool.delete(toolData['Deleted Tool'].id)).rejects.toThrow(NotFoundError);
        await expect(Tool.restore(123)).rejects.toThrow(NotFoundError);
        await expect(Tool.restore(toolData['Test Tool 1'].id)).rejects.toThrow(NotFoundError);
    });
});