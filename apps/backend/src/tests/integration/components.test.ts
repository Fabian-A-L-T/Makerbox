import app from "../../app";
import type { CategoryData, ComponentData, ComponentLocationData, LocationData, ManufacturerData } from "../../utils/schemas";
import { clearCategories, clearComponents, clearLocations, clearManufacturers, clearUsers, seedComponentLocations, seedData, seedUsers, type TestData, type UserDataTest } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };

const categoryData: {[x: string]: CategoryData & TestData} = {
    'Test Category': {id: 0, name: 'Test Category', path: 'Component_Category'}
};
const locationsData: {[x: string]: LocationData & TestData} = {
    'Test Location 1': {id: 0, name: 'Test Location 1', path: 'Test_Location_1'},
    'Test Location 2': {id: 0, name: 'Test Location 2', path: 'Test_Location_2'},
    'Test Location 3': {id: 0, name: 'Test Location 3', path: 'Test_Location_3'}
};
const manufacturersData: {[x: string]: ManufacturerData & TestData} = {
    'Test Manufacturer': {id: 0, name: 'Test Manufacturer', website: 'https://component.example.test'}
};
const usersData: {[x: string]: UserDataTest} = {
    'admin@test.com': {id: 0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id: 0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id: 0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'}
};
const componentsData: {[x: string]: ComponentData & TestData} = {
    'Test Component 1': {id: 0, sku: '001', name: 'Test Component 1', category_id: 0, manufacturer_id: 0, stock: 10},
    'Test Component 2': {id: 0, sku: '002', name: 'Test Component 2', category_id: 0, manufacturer_id: 0, stock: 5},
    'Test Component 3': {id: 0, sku: '003', name: 'Test Component 3', category_id: 0, manufacturer_id: 0, stock: 1},
    'Deleted Component': {id: 0, sku: '004', name: 'Deleted Component', category_id: 0, manufacturer_id: 0, stock: 20, deleted_at: Date()},
};
const componentLocationData: {[x: string]: ComponentLocationData} = {
    'CL1': {component_id: 0, location_id: 0, amount: 10},
    'CL2': {component_id: 0, location_id: 0, amount: 2},
    'CL3': {component_id: 0, location_id: 0, amount: 3},
    'CL4': {component_id: 0, location_id: 0, amount: 1},
    'CL5': {component_id: 0, location_id: 0, amount: 20}
};
beforeAll(async () => {
  await clearComponents();
  await clearCategories();
  await clearManufacturers();
  await clearLocations();
  await clearUsers();

  await seedData('component_categories', categoryData);
  await seedData('locations', locationsData);
  await seedData('manufacturers', manufacturersData);
  await seedUsers(usersData);

  const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
  const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
  const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];

  adminToken = generateAuthHeader(adminData);
  readerToken = generateAuthHeader(readerData);
  technicianToken = generateAuthHeader(technicianData);

  componentsData['Test Component 1'].category_id = categoryData['Test Category'].id;
  componentsData['Test Component 1'].manufacturer_id = manufacturersData['Test Manufacturer'].id;
  componentsData['Test Component 2'].category_id = categoryData['Test Category'].id;
  componentsData['Test Component 2'].manufacturer_id = manufacturersData['Test Manufacturer'].id;
  componentsData['Test Component 3'].category_id = categoryData['Test Category'].id;
  componentsData['Test Component 3'].manufacturer_id = manufacturersData['Test Manufacturer'].id;
  componentsData['Deleted Component'].category_id = categoryData['Test Category'].id;
  componentsData['Deleted Component'].manufacturer_id = manufacturersData['Test Manufacturer'].id;
  await seedData('components', componentsData);

  componentLocationData['CL1'].component_id = componentsData['Test Component 1'].id;
  componentLocationData['CL1'].location_id = locationsData['Test Location 1'].id;
  componentLocationData['CL2'].component_id = componentsData['Test Component 2'].id;
  componentLocationData['CL2'].location_id = locationsData['Test Location 1'].id;
  componentLocationData['CL3'].component_id = componentsData['Test Component 2'].id;
  componentLocationData['CL3'].location_id = locationsData['Test Location 2'].id;

  componentLocationData['CL4'].component_id = componentsData['Test Component 3'].id;
  componentLocationData['CL4'].location_id = locationsData['Test Location 3'].id;

  componentLocationData['CL5'].component_id = componentsData['Deleted Component'].id;
  componentLocationData['CL5'].location_id = locationsData['Test Location 1'].id;
  await seedComponentLocations(componentLocationData);
});
afterAll(async () => {
  await clearComponents();
  await clearCategories();
  await clearManufacturers();
  await clearLocations();
  await clearUsers();
});

describe('admin-only route protection', function() {
  const adminOnlyTestCases: {method: string, path: string}[] = [
    {method: 'post', path: '/api/components'},
    {method: 'put', path: '/api/components/:id'},
    {method: 'delete', path: '/api/components/:id'},
    {method: 'patch', path: '/api/components/:id/restore'},
    {method: 'post', path: '/api/components/:component_id/locations'},
    {method: 'patch', path: '/api/components/:component_id/locations/:location_id'},
    {method: 'delete', path: '/api/components/:component_id/locations/:location_id'}
  ];
  it.each(adminOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });

  it.each(adminOnlyTestCases)('%s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe("GET /components", function() {
  it("should return a list of components", function(done) {
    request(app)
      .get("/api/components")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBeGreaterThan(0);
        expect(response.body.content[0]).toHaveProperty("id");
        expect(response.body.content[0]).toHaveProperty("sku");
        expect(response.body.content[0]).toHaveProperty("name");
        expect(response.body.content[0]).toHaveProperty("category");
        expect(response.body.content[0]).toHaveProperty("manufacturer");
        done();
      })
      .catch(done);
  });

  describe("should have pagination", function(){
    it("should return two components on first page", function(done) {
      request(app)
        .get("/api/components?offset=0&limit=2")
        .set(readerToken)
        .expect(200)
        .then(function(response) {
          expect(response.body.content.length).toEqual(2);
          expect(response.body).toHaveProperty("pagination");
          expect(response.body).toHaveProperty("links");
          done();
        })
        .catch(done);
    });

    it("should return one component on last page", function(done) {
      request(app)
        .get("/api/components?offset=2&limit=2")
        .set(readerToken)
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

describe("GET /components/:id", function() {
  it("should return component data", function(done) {
    request(app)
      .get(`/api/components/${componentsData['Test Component 1'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content[0]).toMatchObject(componentsData['Test Component 1']);
        done();
      })
      .catch(done);
  });

  it("should reject an invalid component id", function(done) {
    request(app)
      .get("/api/components/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a nonexistent component", function(done) {
    request(app)
      .get("/api/components/1234")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found for a deleted component", function(done) {
    request(app)
      .get(`/api/components/${componentsData['Deleted Component'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("POST /components", function() {
  it("should create a component", function(done) {
    const componentData = {
      sku: 'CMP-NEW',
      name: 'New Component',
      category_id: categoryData['Test Category'].id.toString(),
      manufacturer_id: manufacturersData['Test Manufacturer'].id.toString(),
      stock: '3',
      stock_min: '1',
      unit_cost: '4'
    };
    request(app)
      .post("/api/components")
      .send(componentData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data[0]).toMatchObject({sku: componentData.sku, name: componentData.name});
        done();
      })
      .catch(done);
  });

  it("should reject duplicated sku", function(done) {
    const componentData = {
      sku: '001',
      name: 'New Component',
      category_id: categoryData['Test Category'].id.toString(),
      manufacturer_id: manufacturersData['Test Manufacturer'].id.toString(),
      stock: '3',
      stock_min: '1',
      unit_cost: '4'
    };
    request(app)
      .post("/api/components")
      .send(componentData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(409,done);
  });

  it("should reject empty data", function(done) {
    request(app)
      .post("/api/components")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("PUT /components/:id", function() {
  it("should edit a component", function(done) {
    const updatedComponent = {
      sku: 'CMP-001-EDIT',
      name: 'Updated Component',
      category_id: categoryData['Test Category'].id.toString(),
      manufacturer_id: manufacturersData['Test Manufacturer'].id.toString(),
      stock: '12',
      stock_min: '2',
      unit_cost: '5'
    };
    request(app)
      .put(`/api/components/${componentsData['Test Component 1'].id}`)
      .send(updatedComponent)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0]).toMatchObject({sku: updatedComponent.sku, name: updatedComponent.name});
        done();
      })
      .catch(done);
  });

  it("should reject an invalid component id", function(done) {
    request(app)
      .put("/api/components/asd")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a nonexistent component", function(done) {
    const updatedComponent = {
      sku: 'CMP-001-EDIT',
      name: 'Updated Component',
      category_id: categoryData['Test Category'].id.toString(),
      manufacturer_id: manufacturersData['Test Manufacturer'].id.toString(),
      stock: '12',
      stock_min: '2',
      unit_cost: '5'
    };
    request(app)
      .put("/api/components/123456")
      .send(updatedComponent)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found for a deleted component", function(done) {
    const updatedComponent = {
      sku: 'CMP-001-EDIT',
      name: 'Updated Component',
      category_id: categoryData['Test Category'].id.toString(),
      manufacturer_id: manufacturersData['Test Manufacturer'].id.toString(),
      stock: '12',
      stock_min: '2',
      unit_cost: '5'
    };
    request(app)
      .put(`/api/components/${componentsData['Deleted Component'].id}`)
      .send(updatedComponent)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("DELETE /components/:id", function() {
  it("should delete a component", function(done) {
    request(app)
      .delete(`/api/components/${componentsData['Test Component 2'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0]).toHaveProperty("id", componentsData['Test Component 2'].id);
        done();
      })
      .catch(done);
  });

  it("should return not found when deleting a nonexistent component", function(done) {
    request(app)
      .delete("/api/components/123")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when deleting an already deleted component", function(done) {
    request(app)
      .delete(`/api/components/${componentsData['Deleted Component'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("PATCH /components/:id/restore", function() {
  it("should restore a deleted component", function(done) {
    request(app)
      .patch(`/api/components/${componentsData['Deleted Component'].id}/restore`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0]).toHaveProperty("id", componentsData['Deleted Component'].id);
        done();
      })
      .catch(done);
  });
});

describe("Component location routes", function() {
  it("should list locations stocked with a component", function(done) {
    request(app)
      .get(`/api/components/${componentsData['Test Component 1'].id}/locations`)
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content).toHaveLength(1);
        expect(response.body.content[0]).toHaveProperty("location_id", locationsData['Test Location 1'].id);
        expect(response.body.content[0]).toHaveProperty("amount", 10);
        done();
      })
      .catch(done);
  });

  it("should add a component to a location", function(done) {
    request(app)
      .post(`/api/components/${componentsData['Test Component 3'].id}/locations`)
      .send({location_id: locationsData['Test Location 2'].id, amount: 2})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body.data[0]).toMatchObject({component_id: componentsData['Test Component 3'].id, location_id: locationsData['Test Location 2'].id, amount: 2});
        done();
      })
      .catch(done);
  });

  it("should return a component's quantity at a location", function(done) {
    request(app)
      .get(`/api/components/${componentsData['Test Component 2'].id}/locations/${locationsData['Test Location 1'].id}`)
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content[0]).toHaveProperty("amount", 2);
        expect(response.body.content[0]).toHaveProperty("location_name", "Test Location 1");
        done();
      })
      .catch(done);
  });

  it("should update a component's quantity at a location", function(done) {
    request(app)
      .patch(`/api/components/${componentsData['Test Component 1'].id}/locations/${locationsData['Test Location 1'].id}`)
      .send({amount: 4})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0].component_id).toEqual(componentsData['Test Component 1'].id);
        expect(response.body.data[0].location_id).toEqual(locationsData['Test Location 1'].id);
        expect(response.body.data[0]).toHaveProperty("amount", 4);
        done();
      })
      .catch(done);
  });

  it("should remove a component from a location", function(done) {
    request(app)
      .delete(`/api/components/${componentsData['Test Component 2'].id}/locations/${locationsData['Test Location 2'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.data[0]).toHaveProperty("component_id", componentsData['Test Component 2'].id);
        done();
      })
      .catch(done);
  });
});
