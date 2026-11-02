import sql from "../../../config/database";
import Movement from "../../../models/Movement";
import { NotFoundError } from "../../../utils/errors";
import type { CategoryData, ComponentData, ComponentLocationData, LocationData, ManufacturerData, MovementData, ProjectData } from "../../../utils/schemas";
import { clearCategories, clearComponents, clearLocations, clearManufacturers, clearProjects, clearStockMovements, clearUsers, seedComponentLocations, seedData, seedUsers, type UserDataTest } from "../../db/seeder";
import type { TestData } from "../../db/seeder";

const userData: {[x: string]: UserDataTest} = {
    'Movement User': {id: 0, name: 'Movement User', email: 'movement-user@test.com', passwd: 'movement-user-password', role: 'technician'}
};
const categoryData: {[x: string]: CategoryData & TestData} = {
    'Movement Components': {id: 0, name: 'Movement Components', path: 'Movement_Components'}
};
const manufacturerData: {[x: string]: ManufacturerData & TestData} = {
    'Movement Manufacturer': {id: 0, name: 'Movement Manufacturer'}
};
const locationData: {[x: string]: LocationData & TestData} = {
    'Origin': {id: 0, name: 'Origin Location', description: 'Movement source', path: 'Movement_Origin'},
    'Destination': {id: 0, name: 'Destination Location', description: 'Movement target', path: 'Movement_Destination'}
};
const componentData: {[x: string]: ComponentData & TestData} = {
    'Movement Component': {id: 0, sku: 'MOV-CMP-1', name: 'Movement Component', category_id: 0, manufacturer_id: 0, stock: 10, unit_cost: 2}
};
const projectData: {[x: string]: ProjectData & TestData} = {
    'Movement Project': {id: 0, name: 'Movement Project', responsible_id: 0, start_date: '2025-01-01', budget: 1000}
};
const stockData: {[x: string]: ComponentLocationData} = {
    'Origin stock': {component_id: 0, location_id: 0, amount: 10}
};

beforeAll(async () => {
    await clearStockMovements();
    await clearProjects();
    await clearComponents();
    await clearCategories();
    await clearManufacturers();
    await clearLocations();
    await clearUsers();

    await seedUsers(userData);
    await seedData('component_categories', categoryData);
    await seedData('manufacturers', manufacturerData);
    await seedData('locations', locationData);
    componentData['Movement Component'].category_id = categoryData['Movement Components'].id;
    componentData['Movement Component'].manufacturer_id = manufacturerData['Movement Manufacturer'].id;
    await seedData('components', componentData);
    projectData['Movement Project'].responsible_id = userData['Movement User'].id;
    await seedData('projects', projectData);
    stockData['Origin stock'].component_id = componentData['Movement Component'].id;
    stockData['Origin stock'].location_id = locationData['Origin'].id;
    await seedComponentLocations(stockData);
});
afterAll(async () => {
    await clearStockMovements();
    await clearProjects();
    await clearComponents();
    await clearCategories();
    await clearManufacturers();
    await clearLocations();
    await clearUsers();
});

function generateMovementData(type: "entry" | "reserve" | "return" | "transfer" | "disposal", amount: number): MovementData {
    return {
        component_id: componentData['Movement Component'].id,
        stock_type: type,
        amount,
        origin_location_id: locationData['Origin'].id,
        destination_location_id: locationData['Destination'].id,
        project_id: projectData['Movement Project'].id,
        user_id: userData['Movement User'].id,
        notes: 'Model test transfer'
    };
}

describe('Movement create', function() {
    it('creates a movement of type entry and returns its values', async () => {
        const data = generateMovementData('entry',12);
        const res = await Movement.create(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].component_id).toEqual(data.component_id);
        expect(res[0].stock_type).toEqual(data.stock_type);
        expect(res[0].amount).toEqual(data.amount);
        expect(res[0].origin_location_id).toEqual(data.origin_location_id);
        expect(res[0].destination_location_id).toEqual(data.destination_location_id);
        expect(res[0].user_id).toEqual(data.user_id);
        expect(res[0].notes).toEqual(data.notes);
    });

    it('creates a movement of type disposal and returns its values', async () => {
        const data = generateMovementData('disposal',5);
        const res = await Movement.create(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].component_id).toEqual(data.component_id);
        expect(res[0].stock_type).toEqual(data.stock_type);
        expect(res[0].amount).toEqual(data.amount);
        expect(res[0].origin_location_id).toEqual(data.origin_location_id);
        expect(res[0].destination_location_id).toEqual(data.destination_location_id);
        expect(res[0].user_id).toEqual(data.user_id);
        expect(res[0].notes).toEqual(data.notes);
    });

    it('creates a movement of type transfer and returns its values', async () => {
        const data = generateMovementData('transfer',7);
        const res = await Movement.create(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].component_id).toEqual(data.component_id);
        expect(res[0].stock_type).toEqual(data.stock_type);
        expect(res[0].amount).toEqual(data.amount);
        expect(res[0].origin_location_id).toEqual(data.origin_location_id);
        expect(res[0].destination_location_id).toEqual(data.destination_location_id);
        expect(res[0].user_id).toEqual(data.user_id);
        expect(res[0].notes).toEqual(data.notes);
    });

    it('creates a movement of type reserve and returns its values', async () => {
        const data = generateMovementData('reserve',10);
        const res = await Movement.create(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].component_id).toEqual(data.component_id);
        expect(res[0].stock_type).toEqual(data.stock_type);
        expect(res[0].amount).toEqual(data.amount);
        expect(res[0].origin_location_id).toEqual(data.origin_location_id);
        expect(res[0].destination_location_id).toEqual(data.destination_location_id);
        expect(res[0].user_id).toEqual(data.user_id);
        expect(res[0].notes).toEqual(data.notes);
    });

    it('creates a movement of type return and returns its values', async () => {
        const data = generateMovementData('return',5);
        const res = await Movement.create(data);

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty("id");
        expect(res[0].component_id).toEqual(data.component_id);
        expect(res[0].stock_type).toEqual(data.stock_type);
        expect(res[0].amount).toEqual(data.amount);
        expect(res[0].origin_location_id).toEqual(data.origin_location_id);
        expect(res[0].destination_location_id).toEqual(data.destination_location_id);
        expect(res[0].user_id).toEqual(data.user_id);
        expect(res[0].notes).toEqual(data.notes);
    });

    it('rejects disposal of unavailable stock', async () => {
        const data = generateMovementData('disposal',20);
        await expect(Movement.create(data)).rejects.toThrow(sql.PostgresError);
    });

    it('rejects transfer of unavailable stock', async () => {
        const data = generateMovementData('transfer',20);
        await expect(Movement.create(data)).rejects.toThrow(sql.PostgresError);
    });

    it('rejects reserving unavailable stock', async () => {
        const data = generateMovementData('reserve',20);
        await expect(Movement.create(data)).rejects.toThrow(sql.PostgresError);
    });

    it('rejects returning more stock from project than available', async () => {
        const data = generateMovementData('return',6);
        await expect(Movement.create(data)).rejects.toThrow(sql.PostgresError);
    });

    it('rejects returning stock from project with no reservation', async () => {
        const emptyReservationData = generateMovementData('return',5);
        await Movement.create(emptyReservationData);
        const data = generateMovementData('return',6);
        await expect(Movement.create(data)).rejects.toThrow(sql.PostgresError);
    });
});

describe('Movement get', function() {
    it('returns movements with related component, user, locations, and project', async () => {
        const res = await Movement.get({limit: 50, offset: 0});

        expect(Array.isArray(res)).toBe(true);
        expect(res).toHaveLength(6);
        expect(res[0]).toHaveProperty("component_sku", componentData['Movement Component'].sku);
        expect(res[0]).toHaveProperty("component_name", componentData['Movement Component'].name);
        expect(res[0]).toHaveProperty("user_name", userData['Movement User'].name);
        expect(res[0]).toHaveProperty("origin_location_name", locationData['Origin'].name);
        expect(res[0]).toHaveProperty("destination_location_name", locationData['Destination'].name);
        expect(res[0]).toHaveProperty("project_name", projectData['Movement Project'].name);
    });

    it('paginates movements', async () => {
        const firstPage = await Movement.get({limit: 4, offset: 0});
        const secondPage = await Movement.get({limit: 4, offset: 4});

        expect(firstPage).toHaveLength(4);
        expect(secondPage).toHaveLength(2);
    });

    it('orders movements', async () => {
        const ascending = await Movement.get({limit: 3, offset: 0, orderBy: 'created_at'});
        const descending = await Movement.get({limit: 3, offset: 0, orderBy: 'created_at', desc: 'false'});

        expect(new Date(ascending[2].created_at).getTime()).toBeLessThan(new Date(ascending[0].created_at).getTime());
        expect(new Date(descending[2].created_at).getTime()).toBeGreaterThan(new Date(descending[0].created_at).getTime());
    });
});

describe('Movement getById', function() {
    it('returns one movement with joined fields', async () => {
        const [created] = await Movement.create(generateMovementData('entry',1));
        const res = await Movement.getById(created.id);

        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(created.id);
        expect(res[0].component_sku).toEqual(componentData['Movement Component'].sku);
        expect(res[0].origin_location_name).toEqual(locationData['Origin'].name);
        expect(res[0].destination_location_name).toEqual(locationData['Destination'].name);
        expect(res[0].project_name).toEqual(projectData['Movement Project'].name);
    });

    it('throws error if movement id does not exist', async () => {
        await expect(Movement.getById(123)).rejects.toThrow(NotFoundError);
    });
});

