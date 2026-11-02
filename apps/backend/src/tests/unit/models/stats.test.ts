import Stats from "../../../models/Stats";
import { clearCategories, clearComponents, clearProjects, clearToolCategories, clearTools, seedData, updateStatViews } from "../../db/seeder";

const componentCategoryData = {
    'Stats Components': {id: 0, name: 'Stats Components', path: 'Stats_Components'}
};
const toolCategoryData = {
    'Stats Tools': {id: 0, name: 'Stats Tools', path: 'Stats_Tools'}
};
const componentData = {
    'Stats Component 1': {id: 0, sku: 'STAT-CMP-1', name: 'Stats Component 1', category_id: 0, stock: 10, unit_cost: 5},
    'Stats Component 2': {id: 0, sku: 'STAT-CMP-2', name: 'Stats Component 2', category_id: 0, stock: 20, unit_cost: 3}
};
const toolData = {
    'Stats Tool 1': {id: 0, sku: 'STAT-TOL-1', name: 'Stats Tool 1', category_id: 0, state: 'available', cost: 100},
    'Stats Tool 2': {id: 0, sku: 'STAT-TOL-2', name: 'Stats Tool 2', category_id: 0, state: 'maintenance', cost: 200}
};
const projectData = {
    'Stats Project 1': {id: 0, name: 'Stats Project 1', state: 'active', budget: 1000},
    'Stats Project 2': {id: 0, name: 'Stats Project 2', state: 'active', budget: 3000}
};

beforeAll(async () => {
    await clearComponents();
    await clearCategories();
    await clearTools();
    await clearToolCategories();
    await clearProjects();

    await seedData('component_categories', componentCategoryData);
    await seedData('tool_categories', toolCategoryData);
    componentData['Stats Component 1'].category_id = componentCategoryData['Stats Components'].id;
    componentData['Stats Component 2'].category_id = componentCategoryData['Stats Components'].id;
    toolData['Stats Tool 1'].category_id = toolCategoryData['Stats Tools'].id;
    toolData['Stats Tool 2'].category_id = toolCategoryData['Stats Tools'].id;
    await seedData('components', componentData);
    await seedData('tools', toolData);
    await seedData('projects', projectData);
    await updateStatViews();
});
afterAll(async () => {
    await clearComponents();
    await clearCategories();
    await clearTools();
    await clearToolCategories();
    await clearProjects();
    await updateStatViews();
});

describe('Stats getComponentStats', function() {
    it('returns aggregated component statistics by category', async () => {
        const res = await Stats.getComponentStats();

        expect(Array.isArray(res)).toBe(true);
        expect(Number(res[0].category_stock)).toBe(30);
        expect(Number(res[0].category_cost)).toBe(110);
        expect(Number(res[0].avg_unit_cost)).toBeCloseTo(110 / 30);
    });
});

describe('Stats getToolStats', function() {
    it('returns aggregated tool statistics by category', async () => {
        const res = await Stats.getToolStats();

        expect(Array.isArray(res)).toBe(true);
        expect(Number(res[0].category_stock)).toBe(2);
        expect(Number(res[0].category_cost)).toBe(300);
        expect(Number(res[0].avg_cost)).toBe(150);
    });
});

describe('Stats getProjectStats', function() {
    it('returns aggregated project statistics by state', async () => {
        const res = await Stats.getProjectStats();

        expect(Array.isArray(res)).toBe(true);
        expect(Number(res[0].project_count)).toBe(2);
        expect(Number(res[0].total_budget)).toBe(4000);
        expect(Number(res[0].avg_budget)).toBe(2000);
    });
});