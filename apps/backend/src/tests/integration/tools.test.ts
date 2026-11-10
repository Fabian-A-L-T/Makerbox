import app from "../../app";
import type { CategoryData, LocationData, ManufacturerData, ToolData, UserData } from "../../utils/schemas";
import { clearLocations, clearManufacturers, clearToolCategories, clearTools, clearUsers, seedData, type TestData } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken = {Authorization: ''};
let readerToken = {Authorization: ''};
let technicianToken = {Authorization: ''};
const manufacturerData: {[x: string]: ManufacturerData & TestData} = {
    'Test Manufacturer': {id: 0, name: 'Test Manufacturer', website: '/test'}
};
const locationsData: {[x: string]: LocationData & TestData} = {
    'Test Location': {id: 0, name: 'Test Location', description: 'test', path: 'Test_Location'}
};
const toolCategoryData: {[x: string]: CategoryData & TestData} = {
    'Test Category': {id: 0, name: 'Test Category', path: 'Test_Category'}
};
const toolData: {[x: string]: ToolData & TestData} = {
    'TEST-001': {id: 0, name: 'Test tool', sku: 'TEST-001', manufacturer_id: 0, model: 'm1', serial_number: '0001', category_id: 0, location_id: 0, state: 'available'},
    'TEST-002': {id: 0, name: 'Test tool 2', sku: 'TEST-002', manufacturer_id: 0, model: 'm2', serial_number: '0002', category_id: 0, location_id: 0, state: 'available'},
    'TEST-003': {id: 0, name: 'Test tool 3', sku: 'TEST-003', manufacturer_id: 0, model: 'm3', serial_number: '0003', category_id: 0, location_id: 0, state: 'available'},
    'TEST-004': {id: 0, name: 'Test tool 4', sku: 'TEST-004', manufacturer_id: 0, model: 'm4', serial_number: '0004', category_id: 0, location_id: 0, state: 'available'},
    'TEST-005': {id: 0, name: 'Test tool 5', sku: 'TEST-005', manufacturer_id: 0, model: 'm5', serial_number: '0005', category_id: 0, location_id: 0, state: 'available'},
    'TEST-00D': {id: 0, name: 'Test tool D', sku: 'TEST-00D', manufacturer_id: 0, model: 'mD', serial_number: '000D', category_id: 0, location_id: 0, state: 'available', deleted_at: Date()}
};
const usersData: {[x: string]: UserData & TestData & {role: "admin" | "technician" | "reader"}} = {
    'admin@test.com': {id:0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id:0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id:0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'},
    'test@test.com': {id:0, name: 'Test user', email: 'test@test.com', passwd: 'testPass', role: 'admin'},
    'admind@test.com': {id:0, name: 'Deleted Admin user', email: 'admind@test.com', passwd: 'adminPass', role: 'admin', deleted_at: Date()},
};

beforeAll(async () => {
  await clearTools();
  await clearManufacturers();
  await clearLocations();
  await clearToolCategories();
  await clearUsers();

  await seedData('locations', locationsData);
  await seedData('tool_categories', toolCategoryData);
  await seedData('manufacturers', manufacturerData);
  await seedData('users', usersData);
  
  Object.entries(toolData).forEach(([key, _]) => {
    toolData[key].manufacturer_id =  manufacturerData['Test Manufacturer'].id;
    toolData[key].category_id =  toolCategoryData['Test Category'].id;
    toolData[key].location_id =  locationsData['Test Location'].id;
  })

  await seedData<ToolData & TestData>('tools', toolData);

  const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
  const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
  const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];

  adminToken = generateAuthHeader(adminData);
  readerToken = generateAuthHeader(readerData);
  technicianToken = generateAuthHeader(technicianData);
});
afterAll(async () => {
  await clearTools();
  await clearManufacturers();
  await clearLocations();
  await clearToolCategories();
  await clearUsers();
});

describe('admin-only route protection', function() {
  const adminOnlyTestCases: {method: string, path: string}[] = [
    {method: 'post', path: '/api/tools'},
    {method: 'put', path: '/api/tools/:id'},
    {method: 'delete', path: '/api/tools/:id'}
  ];
  it.each(adminOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });

  it.each(adminOnlyTestCases)('%s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe("GET /tools", function() {
  it("should return a list of tools", function(done) {
    request(app)
      .get("/api/tools")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBeGreaterThan(0);
        expect(response.body.content[0]).toHaveProperty("id");
        expect(response.body.content[0]).toHaveProperty("name");
        expect(response.body.content[0]).toHaveProperty("sku");
        expect(response.body.content[0]).toHaveProperty("state");
        expect(response.body.content[0]).toHaveProperty("category");
        expect(response.body.content[0]).toHaveProperty("category_id");
        expect(response.body.content[0]).toHaveProperty("image_url");
        expect(response.body.content[0]).toHaveProperty("location_id");
        expect(response.body.content[0]).toHaveProperty("manual_url");
        expect(response.body.content[0]).toHaveProperty("manufacturer");
        expect(response.body.content[0]).toHaveProperty("manufacturer_id");
        expect(response.body.content[0]).toHaveProperty("model");
        expect(response.body.content[0]).toHaveProperty("notes");
        expect(response.body.content[0]).toHaveProperty("serial_number");
        expect(response.body.content[0]).toHaveProperty("acquisition_date");
        expect(response.body.content[0]).not.toHaveProperty("created_at");
        expect(response.body.content[0]).not.toHaveProperty("updated_at");
        expect(response.body.content[0]).not.toHaveProperty("deleted_at");
        done();
      })
      .catch(done);
  });

  describe('should have pagination', function(){
    it("should return two tools in first page", function(done) {
      request(app)
        .get("/api/tools?offset=0&limit=2")
        .set(adminToken)
        .expect(200)
        .then(function(response) {
          expect(response.body.content.length).toBeLessThanOrEqual(2);
          expect(response.body).toHaveProperty("pagination");
          expect(response.body).toHaveProperty("links");
          done();
        })
        .catch(done);
    });
    it("should return one tool in last page", function(done) {
      request(app)
        .get("/api/tools?offset=4&limit=2")
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

  it("should let readers get a list of tools", function(done) {
    request(app)
      .get("/api/tools")
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBeGreaterThan(0);
        done();
      })
      .catch(done);
  });

  it("should let technicians get a list of tools", function(done) {
    request(app)
      .get("/api/tools")
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBeGreaterThan(0);
        done();
      })
      .catch(done);
  });
});

describe("GET /tools/:id", function() {
  it("should return tool data", function(done) {
    const tool = toolData['TEST-001'];
    request(app)
      .get(`/api/tools/${tool.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
          expect(response.body.content[0]).toHaveProperty("id");
          expect(response.body.content[0]).toHaveProperty("name");
          expect(response.body.content[0]).toHaveProperty("sku");
          expect(response.body.content[0]).toHaveProperty("manufacturer");
          expect(response.body.content[0]).toHaveProperty("manufacturer_id");
          expect(response.body.content[0]).toHaveProperty("model");
          expect(response.body.content[0]).toHaveProperty("serial_number");
          expect(response.body.content[0]).toHaveProperty("category");
          expect(response.body.content[0]).toHaveProperty("category_id");
          expect(response.body.content[0]).toHaveProperty("location_description");
          expect(response.body.content[0]).toHaveProperty("location_name");
          expect(response.body.content[0]).toHaveProperty("location_route");
          expect(response.body.content[0]).toHaveProperty("location_id");
          expect(response.body.content[0]).toHaveProperty("state");
          expect(response.body.content[0]).toHaveProperty("acquisition_date");
          expect(response.body.content[0]).toHaveProperty("image_url");
          expect(response.body.content[0]).toHaveProperty("manual_url");
          expect(response.body.content[0]).toHaveProperty("notes");
          expect(response.body.content[0]).toHaveProperty("created_at");
          expect(response.body.content[0]).not.toHaveProperty("updated_at");
          expect(response.body.content[0]).not.toHaveProperty("deleted_at");
            done();
      })
      .catch(done);
  });

  it("should let readers get tool data", function(done) {
    const tool = toolData['TEST-001'];
    request(app)
      .get(`/api/tools/${tool.id}`)
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content.length).toBeGreaterThan(0);
        done();
      })
      .catch(done);
  });

  it("should let technicians get tool data", function(done) {
    const tool = toolData['TEST-001'];
    request(app)
      .get(`/api/tools/${tool.id}`)
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content.length).toBeGreaterThan(0);
        done();
      })
      .catch(done);
  });

  it("should reject invalid tool id", function(done) {
    request(app)
      .get("/api/tools/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found when fetching a deleted tool", function(done) {
    const tool = toolData['TEST-00D'];
    request(app)
      .get(`/api/tools/${tool.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when fetching a nonexistent tool", function(done) {
    request(app)
      .get("/api/tools/123")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("POST /tools", function() {
  it("should create a tool", function(done) {
    const toolData = {
        name: 'New tool', 
        sku: 'TEST-0006',
        manufacturer_id: manufacturerData['Test Manufacturer'].id.toString(), 
        model: 'm6', 
        serial_number: '0006',
        category_id: toolCategoryData['Test Category'].id.toString(),
        location_id: locationsData['Test Location'].id.toString(),
        state: 'available'
    };
    request(app)
      .post("/api/tools")
      .send(toolData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        done();
      })
      .catch(done);
  });

  it("should reject empty data", function(done) {
    request(app)
      .post("/api/tools")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject duplicated sku", function(done) {
    const toolData = {
        name: 'New tool 2', 
        sku: 'TEST-001',
        model: 'test model 2',
        manufacturer_id: manufacturerData['Test Manufacturer'].id.toString(),
        category_id: toolCategoryData['Test Category'].id.toString(),
        location_id: locationsData['Test Location'].id.toString(),
        serial_number: 'qwerty',
        state: 'available'
    };
    request(app)
      .post("/api/tools")
      .send(toolData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(409, done);
  });

  it("should reject duplicated serial number", function(done) {
    const toolData = {
        name: 'New tool 2', 
        sku: 'TEST-0007',
        model: 'm7',
        manufacturer_id: manufacturerData['Test Manufacturer'].id.toString(),
        category_id: toolCategoryData['Test Category'].id.toString(),
        location_id: locationsData['Test Location'].id.toString(),
        serial_number: '0001',
        state: 'available'
    };
    request(app)
      .post("/api/tools")
      .send(toolData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(409, done);
  });
});

describe("PUT /tools/:id", function() {
  it("should update a tool", function(done) {
    const tool = toolData['TEST-001'];
    const updatedToolData = {
        ...tool,
        manufacturer_id: manufacturerData['Test Manufacturer'].id.toString(), 
        category_id: toolCategoryData['Test Category'].id.toString(),
        location_id: locationsData['Test Location'].id.toString(),
        name: 'New tool 2', 
        sku: 'TEST-0123',
        model: 'test model 2',
        serial_number: 'qwerty',
        state: 'available'
    };
    request(app)
      .put(`/api/tools/${tool.id}`)
      .send(updatedToolData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data).toMatchObject({
          ...updatedToolData, 
          category_id: parseInt(updatedToolData.category_id),
          location_id: parseInt(updatedToolData.location_id),
          manufacturer_id: parseInt(updatedToolData.manufacturer_id),
        });
        done();
      })
      .catch(done);
  });

  it("should reject invalid tool id", function(done) {
    request(app)
      .put("/api/tools/asd")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found when updating nonexistent tool id", function(done) {
    const tool = toolData['TEST-001'];
    const updatedToolData = {
        ...tool,
        manufacturer_id: manufacturerData['Test Manufacturer'].id.toString(), 
        category_id: toolCategoryData['Test Category'].id.toString(),
        location_id: locationsData['Test Location'].id.toString(),
        name: 'New tool 2',
    };
    request(app)
      .put("/api/tools/123")
      .send(updatedToolData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when updating deleted tool id", function(done) {
    const tool = toolData['TEST-00D'];
    const updatedToolData = {
        ...tool,
        manufacturer_id: manufacturerData['Test Manufacturer'].id.toString(), 
        category_id: toolCategoryData['Test Category'].id.toString(),
        location_id: locationsData['Test Location'].id.toString(),
        name: 'New tool 2',
    };
    request(app)
      .put(`/api/tools/${tool.id}`)
      .send(updatedToolData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject empty data", function(done) {
    const tool = toolData['TEST-001'];
    request(app)
      .put(`/api/tools/${tool.id}`)
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject duplicated sku", function(done) {
    const tool = toolData['TEST-001'];
    const updatedToolData = {
        ...tool,
        sku: 'TEST-002',
        manufacturer_id: manufacturerData['Test Manufacturer'].id.toString(),
        category_id: toolCategoryData['Test Category'].id.toString(),
        location_id: locationsData['Test Location'].id.toString()
    };
    
    request(app)
      .put(`/api/tools/${tool.id}`)
      .send(updatedToolData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(409, done);
  });

  it("should reject duplicated serial number", function(done) {
    const tool = toolData['TEST-001'];
    const updatedToolData = {
        ...tool,
        manufacturer_id: manufacturerData['Test Manufacturer'].id.toString(),
        category_id: toolCategoryData['Test Category'].id.toString(),
        location_id: locationsData['Test Location'].id.toString(),
        serial_number: '0002'
    };
    
    request(app)
      .put(`/api/tools/${tool.id}`)
      .send(updatedToolData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(409, done);
  });
});

describe("DELETE /tools/:id", function() {
  it("should delete a tool", function(done) {
    const tool = toolData['TEST-001'];
    request(app)
      .delete(`/api/tools/${tool.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        done();
      })
      .catch(done);
  });

  it("should reject invalid tool id", function(done) {
    request(app)
      .delete(`/api/tools/asd`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found when deleting an already deleted tool", function(done) {
    const tool = toolData['TEST-001'];
    request(app)
      .delete(`/api/tools/${tool.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when deleting a nonexistent tool", function(done) {
    request(app)
      .delete("/api/tools/123")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});
