import Project from "../../../models/Project";
import { NotFoundError } from "../../../utils/errors";
import type { CategoryData, ComponentData, LocationData, ManufacturerData, MilestoneData, ProjectComponentData, ProjectData, ProjectToolData, ToolData } from "../../../utils/schemas";
import { clearCategories, clearComponents, clearLocations, clearManufacturers, clearProjects, clearStockMovements, clearToolCategories, clearTools, clearUsers, seedData, seedProjectComponents, seedProjectTools, seedUsers, type UserDataTest } from "../../db/seeder";
import type { TestData } from "../../db/seeder";

const userData: {[x: string]: UserDataTest} = {
    'Project Owner': {id: 0, name: 'Project Owner', email: 'project-owner@test.com', passwd: 'project-owner-password', role: 'technician'},
    'Other Owner': {id: 0, name: 'Other Owner', email: 'other-owner@test.com', passwd: 'other-owner-password', role: 'reader'}
};
const componentCategoryData: {[x: string]: CategoryData & TestData} = {
    'Project Components': {id: 0, name: 'Project Components', path: 'Project_Components'}
};
const toolCategoryData: {[x: string]: CategoryData & TestData} = {
    'Project Tools': {id: 0, name: 'Project Tools', path: 'Project_Tools'}
};
const manufacturerData: {[x: string]: ManufacturerData & TestData} = {
    'Project Manufacturer': {id: 0, name: 'Project Manufacturer'}
};
const locationData: {[x: string]: LocationData & TestData} = {
    'Project Location': {id: 0, name: 'Project Location', path: 'Project_Location'}
};
const componentData: {[x: string]: ComponentData & TestData} = {
    'Project Component': {id: 0, sku: 'PRJ-CMP-1', name: 'Project Component', category_id: 0, manufacturer_id: 0, stock: 20, unit_cost: 4}
};
const toolData: {[x: string]: ToolData & TestData} = {
    'Project Tool': {id: 0, sku: 'PRJ-TOL-1', name: 'Project Tool', manufacturer_id: 0, model: 'Project Model', category_id: 0, location_id: 0, state: 'available'}
};
const projectData: {[x: string]: ProjectData & TestData & {state: 'planning' | 'active'}} = {
    'Project 1': {id: 0, name: 'Project 1', description: 'First test project', responsible_id: 0, start_date: '2025-01-01', budget: 1000, state: 'active'},
    'Project 2': {id: 0, name: 'Project 2', description: 'Second test project', responsible_id: 0, start_date: '2025-02-01', budget: 2000, state: 'planning'},
    'Project 3': {id: 0, name: 'Project 3', responsible_id: 0, start_date: '2025-03-01', budget: 3000, state: 'active'},
    'Project 4': {id: 0, name: 'Project 4', description: 'Second test project', responsible_id: 0, start_date: '2025-02-01', budget: 2000, state: 'planning'},
    'Deleted Project': {id: 0, name: 'Deleted Project', responsible_id: 0, start_date: '2025-04-01', budget: 4000, state: 'planning', deleted_at: Date()}
};
const projectMilestonesData: {[x: string]: {project_id: number, title: string, order_index: number} & TestData} = {
    'Milestone 1': {id: 0, project_id: 0, title: 'Milestone 1', order_index: 1},
    'Milestone 2': {id: 0, project_id: 0, title: 'Milestone 2', order_index: 2},
    'Milestone 3': {id: 0, project_id: 0, title: 'Milestone 3', order_index: 3},
    'Milestone 4': {id: 0, project_id: 0, title: 'Milestone 4', order_index: 4}
};
const projectComponentsData: {[x: string]: ProjectComponentData} = {
    'PC1': {project_id: 0, component_id: 0, planned_amount: 10, used_amount: 0},
    'PC2': {project_id: 0, component_id: 0, planned_amount: 10, used_amount: 0}
};
const projectToolsData: {[x: string]: ProjectToolData} = {
    'PT1': {project_id: 0, tool_id: 0, user_id:0, loan_date: new Date('2026-9-9'), return_date: new Date('2026-10-10')},
    'PT2': {project_id: 0, tool_id: 0, user_id:0, loan_date: new Date('2026-8-9'), return_date: new Date('2026-10-11')}
};
beforeAll(async () => {
    await clearStockMovements();
    await clearProjects();
    await clearComponents();
    await clearTools();
    await clearCategories();
    await clearToolCategories();
    await clearManufacturers();
    await clearLocations();
    await clearUsers();

    await seedUsers(userData);
    await seedData('component_categories', componentCategoryData);
    await seedData('tool_categories', toolCategoryData);
    await seedData('manufacturers', manufacturerData);
    await seedData('locations', locationData);

    componentData['Project Component'].category_id = componentCategoryData['Project Components'].id;
    componentData['Project Component'].manufacturer_id = manufacturerData['Project Manufacturer'].id;
    await seedData('components', componentData);
    toolData['Project Tool'].manufacturer_id = manufacturerData['Project Manufacturer'].id;
    toolData['Project Tool'].category_id = toolCategoryData['Project Tools'].id;
    toolData['Project Tool'].location_id = locationData['Project Location'].id;
    await seedData('tools', toolData);

    projectData['Project 1'].responsible_id = userData['Project Owner'].id;
    projectData['Project 2'].responsible_id = userData['Project Owner'].id;
    projectData['Deleted Project'].responsible_id = userData['Project Owner'].id;
    projectData['Project 3'].responsible_id = userData['Other Owner'].id;
    projectData['Project 4'].responsible_id = userData['Project Owner'].id;
    await seedData('projects', projectData);

    projectMilestonesData['Milestone 1'].project_id = projectData['Project 1'].id;
    projectMilestonesData['Milestone 2'].project_id = projectData['Project 1'].id;
    projectMilestonesData['Milestone 3'].project_id = projectData['Project 2'].id;
    projectMilestonesData['Milestone 4'].project_id = projectData['Project 2'].id;
    await seedData('project_milestones', projectMilestonesData);

    projectComponentsData['PC1'].project_id = projectData['Project 1'].id;
    projectComponentsData['PC1'].component_id = componentData['Project Component'].id;
    projectComponentsData['PC2'].project_id = projectData['Project 2'].id;
    projectComponentsData['PC2'].component_id = componentData['Project Component'].id;
    await seedProjectComponents(projectComponentsData);

    projectToolsData['PT1'].project_id = projectData['Project 1'].id;
    projectToolsData['PT1'].tool_id = toolData['Project Tool'].id;
    projectToolsData['PT1'].user_id = userData['Project Owner'].id;
    projectToolsData['PT2'].project_id = projectData['Project 2'].id;
    projectToolsData['PT2'].tool_id = toolData['Project Tool'].id;
    projectToolsData['PT2'].user_id = userData['Project Owner'].id;
    await seedProjectTools(projectToolsData)
});
afterAll(async () => {
    await clearStockMovements();
    await clearProjects();
    await clearComponents();
    await clearTools();
    await clearCategories();
    await clearToolCategories();
    await clearManufacturers();
    await clearLocations();
    await clearUsers();
});

describe('Project get', function() {
    it('returns projects for the responsible user', async () => {
        const ownerId = userData['Project Owner'].id;
        const res = await Project.get({limit: 50, offset: 0, responsible_id: ownerId});

        expect(Array.isArray(res)).toBe(true);
        expect(res.map(project => project.id)).not.toContain(projectData['Project 3'].id);
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("name");
        expect(res[0]).toHaveProperty("description");
        expect(res[0]).toHaveProperty("state");
        expect(res[0]).toHaveProperty("start_date");
        expect(res[0]).toHaveProperty("end_date_estimated");
        expect(res[0]).toHaveProperty("end_date_real");
        expect(res[0]).toHaveProperty("responsible_id");
        expect(res[0]).toHaveProperty("budget");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("repository_url");
        expect(res[0]).toHaveProperty("user_name");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('paginates projects', async () => {
        const ownerId = userData['Project Owner'].id;
        const firstPage = await Project.get({limit: 2, offset: 0, responsible_id: ownerId});
        const lastPage = await Project.get({limit: 2, offset: 2, responsible_id: ownerId});

        expect(firstPage).toHaveLength(2);
        expect(lastPage).toHaveLength(1);
    });

    it('orders projects', async () => {
        const ownerId = userData['Project Owner'].id;
        const ascending = await Project.get({limit: 2, offset: 0, orderBy: 'id', responsible_id: ownerId});
        const descending = await Project.get({limit: 2, offset: 0, orderBy: 'id', desc: 'true', responsible_id: ownerId});
        
        expect(ascending[0].id).toBeLessThan(ascending[1].id);
        expect(descending[0].id).toBeGreaterThan(descending[1].id);
    });

    it('filters by state and name', async () => {
        const ownerId = userData['Project Owner'].id;
        const active = await Project.get({limit: 50, offset: 0, state: 'active', search: 'Project', responsible_id: ownerId});

        expect(active).toHaveLength(1);
        expect(active[0].id).toEqual(projectData['Project 1'].id);
    });
});

describe('Project getById', function() {
    it('returns project data and related collections', async () => {
        const project = projectData['Project 1'];
        const res = await Project.getById(project.id, userData['Project Owner'].id);

        expect(res).toMatchObject({...project, user_name: userData['Project Owner'].name, budget: project.budget.toString(), start_date: new Date(project.start_date)});
        expect(res.components[0]).toMatchObject(projectComponentsData['PC1']);
        expect(res.tools[0]).toMatchObject(projectToolsData['PT1']);
        expect(res.milestones).toMatchObject([projectMilestonesData['Milestone 1'], projectMilestonesData['Milestone 2']]);
        expect(res).toHaveProperty("id");
        expect(res).toHaveProperty("end_date_estimated");
        expect(res).toHaveProperty("image_url");
        expect(res).toHaveProperty("repository_url");
        expect(res).not.toHaveProperty("created_at");
        expect(res).not.toHaveProperty("updated_at");
        expect(res).not.toHaveProperty("deleted_at");
    });

    it('throws error when the project is missing or belongs to another user', async () => {
        await expect(Project.getById(123, userData['Project Owner'].id)).rejects.toThrow(NotFoundError);
        await expect(Project.getById(projectData['Project 3'].id, userData['Project Owner'].id)).rejects.toThrow(NotFoundError);
    });
});

describe('Project create and update', function() {
    it('creates a project', async () => {
        const data: ProjectData = {name: 'New Project', description: 'Created for tests', responsible_id: userData['Project Owner'].id, start_date: '2025-06-01', budget: 500};
        const res = await Project.create(data);

        expect(res[0]).toMatchObject({...data, budget: data.budget.toString(), start_date: new Date(data.start_date)});
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("end_date_estimated");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("repository_url");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('updates project', async () => {
        const project = projectData['Project 2'];
        const updated: ProjectData = {...project, name: 'Updated Project', budget: 2500};
        const res = await Project.update(project.id, updated);

        expect(res[0]).toMatchObject({...updated, budget: updated.budget.toString(), start_date: new Date(updated.start_date)});
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("end_date_estimated");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("repository_url");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('updates project state', async () => {
        const project = projectData['Project 2'];
        const res = await Project.updateState(project.id, 'paused');

        expect(res[0].state).toEqual('paused');
    });

    it('throws error when updating a missing project', async () => {
        const data: ProjectData = {name: 'Missing Project', responsible_id: userData['Project Owner'].id, start_date: '2025-01-01', budget: 100};
        await expect(Project.update(123, data)).rejects.toThrow(NotFoundError);
        await expect(Project.updateState(123, 'active')).rejects.toThrow(NotFoundError);
    });
});

describe('Project delete', function() {
    it('deletes a project and throws for an unknown id', async () => {
        const project = projectData['Project 3'];
        const res = await Project.delete(project.id);

        expect(res[0]).toMatchObject({...project, budget: project.budget.toString(), start_date: new Date(project.start_date)});
        expect(res[0]).toHaveProperty("id");
        expect(res[0]).toHaveProperty("end_date_estimated");
        expect(res[0]).toHaveProperty("image_url");
        expect(res[0]).toHaveProperty("repository_url");
        expect(res[0]).not.toHaveProperty("created_at");
        expect(res[0]).not.toHaveProperty("updated_at");
        expect(res[0]).not.toHaveProperty("deleted_at");
    });

    it('throws error when deleting a missing project', async () => {
        const project = projectData['Project 3'];
        await expect(Project.delete(project.id)).rejects.toThrow(NotFoundError);
        await expect(Project.delete(123)).rejects.toThrow(NotFoundError);
    });
});

describe('Project milestones', function() {
    it('creates a milestone belonging to an owned project', async () => {
        const projectId = projectData['Project 1'].id;
        const data = {project_id: projectId, title: 'Initial milestone', description: 'First step', order_index: 1}
        const res = await Project.createMilestone(data);

        expect(res[0]).toMatchObject(data);
    });

    it('updates milestone belonging to an owned project', async () => {
        const userId = userData['Project Owner'].id;
        const milestoneData = projectMilestonesData['Milestone 1'];
        const updated: MilestoneData = {...milestoneData, title: 'Updated milestone', order_index: 2};
        const res = await Project.updateMilestone(userId, milestoneData.id, updated);

        expect(res[0]).toMatchObject(updated);
    });

    it('deletes a milestone belonging to an owned project', async () => {
        const userId = userData['Project Owner'].id;
        const projectId = projectData['Project 1'].id;
        const milestoneData = projectMilestonesData['Milestone 2'];
        const deleted = await Project.deleteMilestone(userId, projectId, milestoneData.id);

        expect(deleted[0]).toMatchObject(milestoneData);
    });

    it('throws error when updating or deleting an invalid milestone', async () => {
        const userId = userData['Project Owner'].id;
        const missingMilestone: MilestoneData = {project_id: projectData['Project 1'].id, title: 'Missing milestone', order_index: 1};
        await expect(Project.updateMilestone(userId, 123, missingMilestone)).rejects.toThrow(NotFoundError);
        await expect(Project.updateMilestone(userId, 123, {...missingMilestone, project_id: 123})).rejects.toThrow(NotFoundError);
        await expect(Project.deleteMilestone(userId, 123, 123)).rejects.toThrow(NotFoundError);
        await expect(Project.deleteMilestone(userId, projectData['Project 1'].id, 123)).rejects.toThrow(NotFoundError);
    });
});

describe('Project components', function() {
    it('adds component to project', async () => {
        const projectId = projectData['Project 4'].id;
        const componentId = componentData['Project Component'].id;
        const data = {project_id: projectId, component_id: componentId, planned_amount: 10, used_amount: 0}
        const res = await Project.addComponent(data);

        expect(res[0]).toMatchObject(data);
    });

    it('updates component added to project', async () => {
        const projectComponent = projectComponentsData['PC1'];
        const updated = {...projectComponent, planned_amount: 2, used_amount: 1}
        const res = await Project.updateComponent(updated);

        expect(res[0]).toMatchObject(updated);
    });

    it('removes component added to project', async () => {
        const projectId = projectComponentsData['PC2'].project_id;
        const componentId = projectComponentsData['PC2'].component_id;
        const res = await Project.removeComponent(projectId, componentId);

        expect(res[0]).toMatchObject(projectComponentsData['PC2']);
    });

    it('throws error when updating or removing an invalid project component', async () => {
        const projectId = projectData['Project 3'].id;
        const componentId = componentData['Project Component'].id;
        const componentAssociation: ProjectComponentData = {project_id: projectId, component_id: componentId, planned_amount: 8, used_amount: 2, notes: 'Initial allocation'};

        await expect(Project.updateComponent(componentAssociation)).rejects.toThrow(NotFoundError);
        await expect(Project.removeComponent(projectId, componentId)).rejects.toThrow(NotFoundError);
    });
});

describe('Project tools', function() {
    it('adds tool to project', async () => {
        const projectId = projectData['Project 4'].id;
        const toolId = toolData['Project Tool'].id;
        const userId = userData['Project Owner'].id;
        const data = {project_id: projectId, tool_id: toolId, user_id: userId}
        const res = await Project.addTool(data);

        expect(res[0]).toMatchObject(data);
    });

    it('updates tool added to project', async () => {
        const projectTool = projectToolsData['PT1'];
        const updated = {...projectTool, loan_date: new Date('2026-9-10'), return_date: new Date('2026-10-9')}
        const res = await Project.updateTool(updated);

        expect(res[0]).toMatchObject(updated);
    });

    it('removes component added to project', async () => {
        const projectId = projectToolsData['PT2'].project_id;
        const componentId = projectToolsData['PT2'].tool_id;
        const res = await Project.removeTool(projectId, componentId);

        expect(res[0]).toMatchObject(projectToolsData['PT2']);
    });

    it('throws error when updating or removing an invalid project tool', async () => {
        const projectId = projectData['Project 3'].id;
        const toolId = toolData['Project Tool'].id;
        const userId = userData['Project Owner'].id;
        const toolAssociation: ProjectToolData = {project_id: projectId, tool_id: toolId, user_id: userId, loan_date: new Date('2025-05-01T00:00:00.000Z')};

        await expect(Project.updateTool(toolAssociation)).rejects.toThrow(NotFoundError);
        await expect(Project.removeTool(projectId, toolId)).rejects.toThrow(NotFoundError);
    });
});