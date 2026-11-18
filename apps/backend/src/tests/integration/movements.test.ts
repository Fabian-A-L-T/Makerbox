import app from "../../app";
import type { CategoryData, ComponentData, ComponentLocationData, LocationData, ManufacturerData, MovementData, ProjectData } from "../../utils/schemas";
import { clearCategories, clearComponents, clearLocations, clearManufacturers, clearProjects, clearStockMovements, clearUsers, seedComponentLocations, seedData, seedUsers, type TestData, type UserDataTest } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };
const categoryData: {[x: string]: CategoryData & TestData} = {
    'Test Category': {id: 0, name: 'Test Category', path: 'Component_Category'}
};
const manufacturersData: {[x: string]: ManufacturerData & TestData} = {
    'Test Manufacturer': {id: 0, name: 'Test Manufacturer', website: 'https://component.example.test'}
};
const locationsData: {[x: string]: LocationData & TestData} = {
    'Test Location 1': {id: 0, name: 'Test Location 1', path: 'Test_Location_1'},
    'Test Location 2': {id: 0, name: 'Test Location 2', path: 'Test_Location_2'},
    'Test Location 3': {id: 0, name: 'Test Location 3', path: 'Test_Location_3'}
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
const usersData: {[x: string]: UserDataTest} = {
    'admin@test.com': {id: 0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id: 0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id: 0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'}
};
const projectsData: {[x: string]: ProjectData & TestData} = {
    'Test Project 1': {id:0, name: 'Test Project 1', start_date: '2026-01-01', budget: 12345, responsible_id: 0},
    'Deleted Project': {id:0, name: 'Deleted Project', start_date: '2026-01-01', budget: 12345, responsible_id: 0, deleted_at: Date()}
};
const stockMovementData: {[x: string]: MovementData & TestData} = {
    'Entry movement': {id: 0, component_id: 0, stock_type: 'entry', amount: 10, origin_location_id: 0, user_id: 0},
    'Disposal movement': {id: 0, component_id: 0, stock_type: 'disposal', amount: 1, origin_location_id: 0, user_id: 0},
    'Reserve movement': {id: 0, component_id: 0, stock_type: 'reserve', amount: 1, origin_location_id: 0,  user_id: 0, project_id: 0},
    'Transfer movement': {id: 0, component_id: 0, stock_type: 'transfer', amount: 10, origin_location_id: 0, destination_location_id: 0, user_id: 0}
};
const returnMovementData: {[x: string]: MovementData & TestData} = {
    'Return movement': {id: 0, component_id: 0, stock_type: 'return', amount: 1, origin_location_id: 0,  user_id: 0, project_id: 0}
};
beforeAll(async () => {
  await clearCategories();
  await clearLocations();
  await clearManufacturers();
  await clearProjects();
  await clearComponents();
  await clearUsers();
  await clearStockMovements();

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

  projectsData['Test Project 1'].responsible_id = adminData.id;
  projectsData['Deleted Project'].responsible_id = technicianData.id;
  await seedData('projects', projectsData);

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

  stockMovementData['Entry movement'].component_id = componentsData['Test Component 1'].id;
  stockMovementData['Entry movement'].origin_location_id = locationsData['Test Location 1'].id;
  stockMovementData['Entry movement'].user_id = usersData['admin@test.com'].id;

  stockMovementData['Disposal movement'].component_id = componentsData['Test Component 2'].id;
  stockMovementData['Disposal movement'].origin_location_id = locationsData['Test Location 1'].id;
  stockMovementData['Disposal movement'].user_id = usersData['admin@test.com'].id;

  stockMovementData['Reserve movement'].component_id = componentsData['Test Component 2'].id;
  stockMovementData['Reserve movement'].origin_location_id = locationsData['Test Location 1'].id;
  stockMovementData['Reserve movement'].project_id = projectsData['Test Project 1'].id;
  stockMovementData['Reserve movement'].user_id = usersData['admin@test.com'].id;

  stockMovementData['Transfer movement'].component_id = componentsData['Test Component 1'].id;
  stockMovementData['Transfer movement'].origin_location_id = locationsData['Test Location 1'].id;
  stockMovementData['Transfer movement'].destination_location_id = locationsData['Test Location 2'].id;
  stockMovementData['Transfer movement'].user_id = usersData['admin@test.com'].id;
  await seedData('stock_movements', stockMovementData);

  returnMovementData['Return movement'].component_id = componentsData['Test Component 2'].id;
  returnMovementData['Return movement'].origin_location_id = locationsData['Test Location 1'].id;
  returnMovementData['Return movement'].project_id = projectsData['Test Project 1'].id;
  returnMovementData['Return movement'].user_id = usersData['admin@test.com'].id;
  await seedData('stock_movements', returnMovementData);
});
afterAll(async () => {
  await clearCategories();
  await clearLocations();
  await clearManufacturers();
  await clearProjects();
  await clearComponents();
  await clearUsers();
  await clearStockMovements();
});

describe('admin-only route protection', function() {
  const adminOnlyTestCases: {method: string, path: string}[] = [
    {method: 'get', path: '/api/movements'},
    {method: 'get', path: '/api/movements/:id'},
    {method: 'post', path: '/api/movements'}
  ];
  it.each(adminOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });

  it.each(adminOnlyTestCases)('%s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe("GET /movements", function() {
  it("should return a list of movements", function(done) {
    request(app)
      .get("/api/movements")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBeGreaterThan(0);
        expect(response.body.content[0]).toHaveProperty("component_sku");
        expect(response.body.content[0]).toHaveProperty("component_name");
        expect(response.body.content[0]).toHaveProperty("user_name");
        done();
      })
      .catch(done);
  });

  describe("should have pagination", function(){
    it("should return three movements in first page", function(done) {
      request(app)
        .get("/api/movements?offset=0&limit=3")
        .set(adminToken)
        .expect(200)
        .then(function(response) {
          expect(response.body.content.length).toEqual(3);
          expect(response.body).toHaveProperty("pagination");
          expect(response.body).toHaveProperty("links");
          done();
        })
        .catch(done);
    });

    it("should return two movements in last page", function(done) {
      request(app)
        .get("/api/movements?offset=3&limit=3")
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
  })
});

describe("GET /movements/:id", function() {
  it("should return movement data (entry type)", function(done) {
    request(app)
      .get(`/api/movements/${stockMovementData['Entry movement'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content[0]).toMatchObject({
          id: stockMovementData['Entry movement'].id,
          component_sku: componentsData['Test Component 1'].sku,
          component_name: componentsData['Test Component 1'].name,
          origin_location_name: locationsData['Test Location 1'].name,
          user_name: usersData['admin@test.com'].name
        });
        done();
      })
      .catch(done);
  });

  it("should return movement data (disposal type)", function(done) {
    request(app)
      .get(`/api/movements/${stockMovementData['Disposal movement'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content[0]).toMatchObject({
          id: stockMovementData['Disposal movement'].id,
          component_sku: componentsData['Test Component 2'].sku,
          component_name: componentsData['Test Component 2'].name,
          origin_location_name: locationsData['Test Location 1'].name,
          user_name: usersData['admin@test.com'].name
        });
        done();
      })
      .catch(done);
  });

  it("should return movement data (reserve type)", function(done) {
    request(app)
      .get(`/api/movements/${stockMovementData['Reserve movement'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content[0]).toMatchObject({
          id: stockMovementData['Reserve movement'].id,
          component_sku: componentsData['Test Component 2'].sku,
          component_name: componentsData['Test Component 2'].name,
          origin_location_name: locationsData['Test Location 1'].name,
          user_name: usersData['admin@test.com'].name,
          project_name: projectsData['Test Project 1'].name
        });
        done();
      })
      .catch(done);
  });

  it("should return movement data (return type)", function(done) {
    request(app)
      .get(`/api/movements/${returnMovementData['Return movement'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content[0]).toMatchObject({
          id: returnMovementData['Return movement'].id,
          component_sku: componentsData['Test Component 2'].sku,
          component_name: componentsData['Test Component 2'].name,
          origin_location_name: locationsData['Test Location 1'].name,
          user_name: usersData['admin@test.com'].name,
          project_name: projectsData['Test Project 1'].name
        });
        done();
      })
      .catch(done);
  });

  it("should return movement data (transfer type)", function(done) {
    request(app)
      .get(`/api/movements/${stockMovementData['Transfer movement'].id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content[0]).toMatchObject({
          id: stockMovementData['Transfer movement'].id,
          component_sku: componentsData['Test Component 1'].sku,
          component_name: componentsData['Test Component 1'].name,
          origin_location_name: locationsData['Test Location 1'].name,
          destination_location_name: locationsData['Test Location 2'].name,
          user_name: usersData['admin@test.com'].name
        });
        done();
      })
      .catch(done);
  });

  it("should reject an invalid movement id", function(done) {
    request(app)
      .get("/api/movements/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a nonexistent movement", function(done) {
    request(app)
      .get("/api/movements/123456")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("POST /movements", function() {
  it("should create a movement (entry type)", function(done) {
      const movementData = {
        component_id: componentsData['Test Component 2'].id.toString(),
        stock_type: 'entry',
        amount: '2',
        user_id: usersData['admin@test.com'].id.toString(),
        origin_location_id: locationsData['Test Location 2'].id.toString(),
        notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toMatchObject({
          component_id: componentsData['Test Component 2'].id,
          origin_location_id: locationsData['Test Location 2'].id,
          stock_type: movementData.stock_type,
          amount: 2,
          user_id: usersData['admin@test.com'].id
        });
        done();
      })
      .catch(done);
  });

  it("should create a movement (disposal type)", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 1'].id.toString(),
      stock_type: 'disposal',
      amount: '2',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 1'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toMatchObject({
          component_id: componentsData['Test Component 1'].id,
          origin_location_id: locationsData['Test Location 1'].id,
          stock_type: movementData.stock_type,
          amount: 2,
          user_id: usersData['admin@test.com'].id
        });
        done();
      })
      .catch(done);
  });

  it("should create a movement (reserve type)", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 1'].id.toString(),
      stock_type: 'reserve',
      amount: '5',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 1'].id.toString(),
      project_id: projectsData['Test Project 1'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toMatchObject({
          component_id: componentsData['Test Component 1'].id,
          origin_location_id: locationsData['Test Location 1'].id,
          stock_type: movementData.stock_type,
          amount: 5,
          user_id: usersData['admin@test.com'].id
        });
        done();
      })
      .catch(done);
  });

  it("should create a movement (return type)", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 1'].id.toString(),
      stock_type: 'return',
      amount: '1',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 1'].id.toString(),
      project_id: projectsData['Test Project 1'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toMatchObject({
          component_id: componentsData['Test Component 1'].id,
          origin_location_id: locationsData['Test Location 1'].id,
          stock_type: movementData.stock_type,
          amount: 1,
          user_id: usersData['admin@test.com'].id
        });
        done();
      })
      .catch(done);
  });

  it("should create a movement (transfer type)", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 1'].id.toString(),
      stock_type: 'transfer',
      amount: '2',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 1'].id.toString(),
      destination_location_id: locationsData['Test Location 2'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toMatchObject({
          component_id: componentsData['Test Component 1'].id,
          origin_location_id: locationsData['Test Location 1'].id,
          stock_type: movementData.stock_type,
          amount: 2,
          user_id: usersData['admin@test.com'].id
        });
        done();
      })
      .catch(done);
  });

  it("should reject wrong amount (disposal of stock greater than available)", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 2'].id.toString(),
      stock_type: 'disposal',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 1'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject wrong amount (reserve stock greater than available)", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 2'].id.toString(),
      stock_type: 'reserve',
      amount: '100',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 1'].id.toString(),
      project_id: projectsData['Test Project 1'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject wrong amount (return stock greater than available)", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 2'].id.toString(),
      stock_type: 'return',
      amount: '100',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 1'].id.toString(),
      project_id: projectsData['Test Project 1'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject wrong amount (transfer stock greater than available)", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 1'].id.toString(),
      stock_type: 'transfer',
      amount: '1000',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 1'].id.toString(),
      destination_location_id: locationsData['Test Location 2'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject missing origin location id for entry types", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 3'].id.toString(),
      stock_type: 'entry',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422)
      .then(function(response) {
        expect(response.body).toHaveProperty("message", "Existen datos faltantes");
        done();
      })
      .catch(done);
  });

  it("should reject missing origin location id for disposal types", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 3'].id.toString(),
      stock_type: 'disposal',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422)
      .then(function(response) {
        expect(response.body).toHaveProperty("message", "Existen datos faltantes");
        done();
      })
      .catch(done);
  });

  it("should reject missing origin location id for reserve types", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 3'].id.toString(),
      stock_type: 'reserve',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      project_id: projectsData['Test Project 1'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422)
      .then(function(response) {
        expect(response.body).toHaveProperty("message", "Existen datos faltantes");
        done();
      })
      .catch(done);
  });

  it("should reject missing origin location id for return types", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 3'].id.toString(),
      stock_type: 'return',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      project_id: projectsData['Test Project 1'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422)
      .then(function(response) {
        expect(response.body).toHaveProperty("message", "Existen datos faltantes");
        done();
      })
      .catch(done);
  });

  it("should reject missing origin location id for transfer types", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 3'].id.toString(),
      stock_type: 'transfer',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      project_id: projectsData['Test Project 1'].id.toString(),
      destination_location_id: locationsData['Test Location 2'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422)
      .then(function(response) {
        expect(response.body).toHaveProperty("message", "Existen datos faltantes");
        done();
      })
      .catch(done);
  });

  it("should reject missing project id for reserve types", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 3'].id.toString(),
      stock_type: 'reserve',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 2'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422)
      .then(function(response) {
        expect(response.body).toHaveProperty("message", "Existen datos faltantes");
        done();
      })
      .catch(done);
  });

  it("should reject missing project id for return types", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 3'].id.toString(),
      stock_type: 'return',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 2'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422)
      .then(function(response) {
        expect(response.body).toHaveProperty("message", "Existen datos faltantes");
        done();
      })
      .catch(done);
  });

  it("should reject missing destination location id for transfer types", function(done) {
    const movementData = {
      component_id: componentsData['Test Component 3'].id.toString(),
      stock_type: 'transfer',
      amount: '12',
      user_id: usersData['admin@test.com'].id.toString(),
      origin_location_id: locationsData['Test Location 2'].id.toString(),
      notes: 'Integration test movement'
    };
    request(app)
      .post("/api/movements")
      .send(movementData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422)
      .then(function(response) {
        expect(response.body).toHaveProperty("message", "Existen datos faltantes");
        done();
      })
      .catch(done);
  });

  it("should reject empty data", function(done) {
    request(app)
      .post("/api/movements")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});
