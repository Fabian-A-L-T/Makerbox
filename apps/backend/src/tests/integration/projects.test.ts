import app from "../../app";
import sql from "../../config/database";
import type { CategoryData, ComponentData, LocationData, ManufacturerData, ProjectData } from "../../utils/schemas";
import { type TestData, type UserDataTest, seedData, seedUsers } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };

const categoryData: {[x: string]: CategoryData & TestData} = {
    'Test Category': {id: 0, name: 'Project Test Category', path: 'Project_Test_Category'}
};
const toolCategoryData: {[x: string]: CategoryData & TestData} = {
    'Test Tool Category': {id: 0, name: 'Project Test Tool Category', path: 'Project_Test_Tool_Category'}
};
const manufacturersData: {[x: string]: ManufacturerData & TestData} = {
    'Test Manufacturer': {id: 0, name: 'Project Test Manufacturer', website: 'https://project.example.test'}
};
const locationsData: {[x: string]: LocationData & TestData} = {
    'Test Location': {id: 0, name: 'Project Test Location', description: 'Project test location', path: 'Project_Test_Location'}
};
const componentsData: {[x: string]: ComponentData & TestData} = {
    'Test Component': {id: 0, sku: 'LOC-001', name: 'Test Component', category_id: 0, manufacturer_id: 0, stock: 1}
};
const projectsData: {[x: string]: ProjectData & TestData} = {
    'Test Project 1': {id:0, name: 'Test Project 1', start_date: '2026-01-01', budget: 12345, responsible_id: 0},
    'Test Project 2': {id:0, name: 'Test Project 2', start_date: '2026-01-01', budget: 12345, responsible_id: 0},
    'Test Project 3': {id:0, name: 'Test Project 3', start_date: '2026-01-01', budget: 12345, responsible_id: 0},
    'Test Project 4': {id:0, name: 'Test Project 4', start_date: '2026-01-01', budget: 12345, responsible_id: 0},
    'Deleted Project': {id:0, name: 'Deleted Project', start_date: '2026-01-01', budget: 12345, responsible_id: 0, deleted_at: Date()}
};
const projectMilestonesData: {[x: string]: {project_id: number, title: string, order_index: number} & TestData} = {
    'Test Milestone 1': {id: 0, project_id: 0, title: 'Test Milestone 1', order_index: 1},
    'Test Milestone 2': {id: 0, project_id: 0, title: 'Test Milestone 2', order_index: 2},
    'Test Milestone 3': {id: 0, project_id: 0, title: 'Test Milestone 3', order_index: 3},
    'Test Milestone 4': {id: 0, project_id: 0, title: 'Test Milestone 4', order_index: 4}
};
const usersData: {[x: string]: UserDataTest} = {
    'admin@test.com': {id:0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id:0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id:0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'}
};

beforeAll(async () => {
    await seedUsers(usersData);
    await seedData('component_categories', categoryData);
    await seedData('tool_categories', toolCategoryData);
    await seedData('manufacturers', manufacturersData);
    await seedData('locations', locationsData);

    const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
    const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
    const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];
    adminToken = generateAuthHeader(adminData);
    readerToken = generateAuthHeader(readerData);
    technicianToken = generateAuthHeader(technicianData);

    componentsData['Test Component'].category_id = categoryData['Test Category'].id;
    componentsData['Test Component'].manufacturer_id = manufacturersData['Test Manufacturer'].id;
    await seedData('components', componentsData);

    projectsData['Test Project 1'].responsible_id = adminData.id;
    projectsData['Test Project 2'].responsible_id = adminData.id;
    projectsData['Test Project 3'].responsible_id = adminData.id;
    projectsData['Test Project 4'].responsible_id = technicianData.id;
    projectsData['Deleted Project'].responsible_id = technicianData.id;
    await seedData('projects', projectsData);
    
    projectMilestonesData['Test Milestone 1'].project_id = projectsData['Test Project 1'].id;
    projectMilestonesData['Test Milestone 2'].project_id = projectsData['Test Project 1'].id;
    projectMilestonesData['Test Milestone 3'].project_id = projectsData['Test Project 2'].id;
    projectMilestonesData['Test Milestone 4'].project_id = projectsData['Test Project 2'].id;
    await seedData('project_milestones', projectMilestonesData);
});
afterAll(async () => {
    await sql`TRUNCATE projects, tools, components, manufacturers, locations, tool_categories, component_categories, users RESTART IDENTITY CASCADE`;
});

describe('admin-only route protection', function() {
  const adminOnlyTestCases: {method: string, path: string}[] = [
    {method: 'put', path: '/api/projects/:id'},
    {method: 'delete', path: '/api/projects/:id'},
    {method: 'post', path: '/api/projects/:project_id/tools'},
    {method: 'patch', path: '/api/projects/:project_id/tools/:tool_id'},
    {method: 'delete', path: '/api/projects/:project_id/tools/:tool_id'},
    {method: 'post', path: '/api/projects/:project_id/components'},
    {method: 'patch', path: '/api/projects/:project_id/components/:component_id'},
    {method: 'delete', path: '/api/projects/:project_id/components/:component_id'}
  ];
  it.each(adminOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });
  it.each(adminOnlyTestCases)('%s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe('technician-only route protection', function() {
  const technicianOnlyTestCases: {method: string, path: string}[] = [
    {method: 'get', path: '/api/projects'},
    {method: 'get', path: '/api/projects/:id'},
    {method: 'post', path: '/api/projects'},
    {method: 'post', path: '/api/projects/:project_id/milestones'},
    {method: 'put', path: '/api/projects/:project_id/milestones/:milestone_id'},
    {method: 'delete', path: '/api/projects/:project_id/milestones/:milestone_id'},
    {method: 'get', path: '/api/projects/:project_id/components'}
  ];
  it.each(technicianOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });
});

describe("GET /projects", function() {
  it("should return projects assigned to the authenticated admin", function(done) {
    request(app).get("/api/projects")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.every(
          (project: {responsible_id: number}) => project.responsible_id === usersData['admin@test.com'].id)).toBe(true);
        done();
      })
      .catch(done);
  });

  it("should return projects assigned to the authenticated technician", function(done) {
    request(app).get("/api/projects")
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.every(
          (project: {responsible_id: number}) => project.responsible_id === usersData['technician@test.com'].id)).toBe(true);
        done();
      })
      .catch(done);
  });

  describe("should include pagination", function() {
    it("should return two projects in first page", function(done) {
      request(app).get("/api/projects?offset=0&limit=2")
        .set(adminToken)
        .expect(200)
        .then(function(response) {
          expect(response.body.content.length).toEqual(2);
          expect(response.body).toHaveProperty("pagination");
          expect(response.body).toHaveProperty("links");
          done();
        })
        .catch(done);
    });

    it("should return one project in last page", function(done) {
      request(app).get("/api/projects?offset=2&limit=2")
        .set(adminToken)
        .expect(200)
        .then(function(response) {
          expect(response.body.content.length).toEqual(1);
          expect(response.body).toHaveProperty("pagination");
          expect(response.body).toHaveProperty("links");
          done();
        })
        .catch(done);
    });
  })
});

describe("GET /projects/:id", function() {
  it("should return project data and related collections", function(done) {
    request(app).get(`/api/projects/${projectsData['Test Project 1'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content).toMatchObject({id: projectsData['Test Project 1'].id, name: 'Test Project 1'});
        expect(Array.isArray(response.body.content.components)).toBe(true);
        expect(Array.isArray(response.body.content.tools)).toBe(true);
        expect(Array.isArray(response.body.content.milestones)).toBe(true);
        done();
      })
      .catch(done);
  });

  it("should reject invalid id", function(done) {
    request(app).get("/api/projects/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422,done);
  });

  it("should return not found for a nonexistent project", function(done) {
    request(app).get("/api/projects/1234")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404,done);
  });

  it("should return not found for a deleted project", function(done) {
    request(app).get(`/api/projects/${projectsData['Deleted Project'].id}`)
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(404,done);
  });

  it("should return not found for a project owned by another user", function(done) {
    request(app).get(`/api/projects/${projectsData['Test Project 1'].id}`)
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(404,done);
  });
});

describe("POST /projects", function() {
  it("should create a project", function(done) {
    request(app).post("/api/projects")
      .set(adminToken)
      .send({name: 'Created Project', start_date: '2026-02-01', budget: '200', compList: {}, milestoneList: []})
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toMatchObject({status: 'ok'});
        done();
      })
      .catch(done);
  });

  it("should reject a project with component out-of-stock", function(done) {
    request(app).post("/api/projects")
      .set(adminToken)
      .send({name: 'Created Project', start_date: '2026-02-01', budget: '200', 
        compList: {[componentsData['Test Component'].name] :{id: componentsData['Test Component'].id, selectedStock: 12}}, milestoneList: []})
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toMatchObject({status: 'fail'});
        done();
      })
      .catch(done);
  });

  it("should reject a project with nonexistent component", function(done) {
    request(app).post("/api/projects")
      .set(adminToken)
      .send({name: 'Created Project', start_date: '2026-02-01', budget: '200', 
        compList: {"asd" :{id: 1234, selectedStock: 12}}, milestoneList: []})
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toMatchObject({status: 'fail'});
        done();
      })
      .catch(done);
  });

  it("should reject invalid compList (stock > 50)", function(done) {
    request(app).post("/api/projects")
      .set(adminToken)
      .send({name: 'Created Project', start_date: '2026-02-01', budget: '200', 
        compList: {"asd" :{id: 1234, selectedStock: 999}}, milestoneList: []})
      .expect("Content-Type", /json/)
      .expect(422,done);
  });

  it("should reject invalid milestoneList", function(done) {
    request(app).post("/api/projects")
      .set(adminToken)
      .send({name: 'Created Project', start_date: '2026-02-01', budget: '200', 
        compList: {}, milestoneList: [{title: 123, description: 'asd'}]})
      .expect("Content-Type", /json/)
      .expect(422,done);
  });

  it("should reject empty data", function(done) {
    request(app).post("/api/projects").set(adminToken).send({}).expect(422,done);
  });
});

describe("PUT /projects/:id", function() {
  it("should update a project", function(done) {
    request(app).put(`/api/projects/${projectsData['Test Project 1'].id}`)
      .set(adminToken)
      .send({name: 'Updated Project', start_date: '2026-01-01', budget: '150'})
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0]).toHaveProperty('name', 'Updated Project');
        done();
      })
      .catch(done);
  });

  it("should reject invalid project id", function(done) {
    request(app).put("/api/projects/asd")
      .set(adminToken)
      .send({name: 'Updated Project', start_date: '2026-01-01', budget: '150'})
      .expect("Content-Type", /json/)
      .expect(422,done);
  });

  it("should return not found for a nonexistent project", function(done) {
    request(app).put("/api/projects/123")
      .set(adminToken)
      .send({name: 'Updated Project', start_date: '2026-01-01', budget: '150'})
      .expect("Content-Type", /json/)
      .expect(404,done);
  });

  it("should return not found for a deleted project", function(done) {
    request(app).put(`/api/projects/${projectsData['Deleted Project'].id}`)
      .set(adminToken)
      .send({name: 'Updated Project', start_date: '2026-01-01', budget: '150'})
      .expect("Content-Type", /json/)
      .expect(404,done);
  });

  it("should reject empty data", function(done) {
    request(app).put(`/api/projects/${projectsData['Test Project 1'].id}`)
      .set(adminToken)
      .send({})
      .expect("Content-Type", /json/)
      .expect(422,done);
  });
});

describe("DELETE /projects/:id", function() {
  it("should delete a project", function(done) {
    request(app).delete(`/api/projects/${projectsData['Test Project 3'].id}`)
    .set(adminToken)
    .expect("Content-Type", /json/)
    .expect(200)
    .then(function(response) {
      expect(response.body.data[0]).toHaveProperty('id', projectsData['Test Project 3'].id);
      done();
    })
    .catch(done);
  });

  it("should reject invalid project id", function(done) {
    request(app).delete("/api/projects/asd")
    .set(adminToken)
    .expect("Content-Type", /json/)
    .expect(422,done);
  });

  it("should return not found for a nonexistent project", function(done) {
    request(app).delete("/api/projects/123")
    .set(adminToken)
    .expect("Content-Type", /json/)
    .expect(404,done);
  });

  it("should return not found for a deleted project", function(done) {
    request(app).delete(`/api/projects/${projectsData['Deleted Project'].id}`)
    .set(adminToken)
    .expect("Content-Type", /json/)
    .expect(404,done);
  });
});

describe("Project milestone routes", function() {
  it("should create a milestone", function(done) {
    request(app)
      .post(`/api/projects/${projectsData['Test Project 1'].id}/milestones`)
      .set(adminToken)
      .send({title: 'New Milestone', description: 'Created by integration test', order_index: '1'})
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0].title).toBe('New Milestone');
        done();
      })
      .catch(done);
  });

  it("should update a milestone", function(done) {
    request(app)
      .put(`/api/projects/${projectsData['Test Project 1'].id}/milestones/${projectMilestonesData['Test Milestone 1'].id}`)
      .set(adminToken)
      .send({title: 'Updated Milestone', description: 'Updated milestone', order_index: '0'})
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0].title).toBe('Updated Milestone');
        done();
      })
      .catch(done)
  });

  it("should delete a milestone", function(done) {
    request(app)
      .delete(`/api/projects/${projectsData['Test Project 1'].id}/milestones/${projectMilestonesData['Test Milestone 2'].id}`)
      .set(adminToken)
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0].id).toEqual(projectMilestonesData['Test Milestone 2'].id);
        done();
      })
      .catch(done);
  });
});

describe("Project component routes", function() {
  it("should return project components", function(done) {
    request(app)
      .get(`/api/projects/${projectsData['Test Project 1'].id}/components`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        done();
      })
      .catch(done);
  });

  it("should add a component to a project", function(done) {
    request(app)
      .post(`/api/projects/${projectsData['Test Project 1'].id}/components`)
      .set(adminToken)
      .send({component_id: componentsData['Test Component'].id, planned_amount: 4, used_amount: 0, notes: 'Project component test'})
      .expect(201)
      .then(function(response) {
        expect(response.body.data[0]).toMatchObject({project_id: projectsData['Test Project 1'].id, component_id: componentsData['Test Component'].id});
        done();
      })
      .catch(done);
  });

  it("should update a project component", function(done) {
    request(app)
      .patch(`/api/projects/${projectsData['Test Project 1'].id}/components/${componentsData['Test Component'].id}`)
      .set(adminToken)
      .send({planned_amount: 6, used_amount: 1, notes: 'Updated project component'})
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0]).toMatchObject({project_id: projectsData['Test Project 1'].id, component_id: componentsData['Test Component'].id});
        done();
      }).
      catch(done);
  });

  it("should remove a component from a project", function(done) {
    request(app)
      .delete(`/api/projects/${projectsData['Test Project 1'].id}/components/${componentsData['Test Component'].id}`)
      .set(adminToken)
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0]).toHaveProperty('component_id', componentsData['Test Component'].id);
        done();
      })
      .catch(done);
  });
});
