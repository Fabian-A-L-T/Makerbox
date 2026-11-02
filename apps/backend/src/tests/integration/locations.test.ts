import app from "../../app";
import type { CategoryData, ComponentData, ComponentLocationData, LocationData, ManufacturerData } from "../../utils/schemas";
import { clearCategories, clearComponents, clearLocations, clearManufacturers, clearUsers, seedComponentLocations, seedData, seedUsers, type TestData, type UserDataTest } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };
const locationsData: {[x: string]: LocationData & TestData} = {
    'Test Location': {id: 0, name: 'Test Location', description: 'Test location', path: 'Test_Location'},
    'Test Sub-location': {id: 0, name: 'Test Sub-location', description: 'Nested test location', path: 'Test_Location.Test_Sub_location'},
    'Test Location 2': {id: 0, name: 'Test Location 2', description: 'Test location 2', path: 'Test_Location_2'},
    'Test Sub-location 2': {id: 0, name: 'Test Sub-location 2', description: 'Nested test location 2', path: 'Test_Location_2.Test_Sub_location_2'},
    'Deleted Location': {id: 0, name: 'Deleted Location', description: 'deleted location', path: 'Deleted_Location', deleted_at: Date()}
};
const categoryData: {[x: string]: CategoryData & TestData} = {
    'Test Category': {id: 0, name: 'Test Category', path: 'Test_Category'}
};
const manufacturersData: {[x: string]: ManufacturerData & TestData} = {
    'Test Manufacturer': {id: 0, name: 'Test Manufacturer'}
};
const componentsData: {[x: string]: ComponentData & TestData} = {
    'Test Component': {id: 0, sku: 'LOC-001', name: 'Test Component', category_id: 0, manufacturer_id: 0}
};
const componentLocationData: {[x: string]: ComponentLocationData} = {
    'CL1': {component_id: 0, location_id: 0, amount: 5},
    'CL2': {component_id: 0, location_id: 0, amount: 12}
};
const usersData: {[x: string]: UserDataTest} = {
    'admin@test.com': {id: 0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id: 0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id: 0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'}
};

beforeAll(async () => {
    await seedData('locations', locationsData);
    await seedData('component_categories', categoryData);
    await seedData('manufacturers', manufacturersData);

    componentsData['Test Component'].category_id = categoryData['Test Category'].id;
    componentsData['Test Component'].manufacturer_id = manufacturersData['Test Manufacturer'].id;
    await seedData('components', componentsData);

    componentLocationData['CL1'].component_id = componentsData['Test Component'].id;
    componentLocationData['CL1'].location_id = locationsData['Test Location'].id;

    componentLocationData['CL2'].component_id = componentsData['Test Component'].id;
    componentLocationData['CL2'].location_id = locationsData['Deleted Location'].id;
    await seedComponentLocations(componentLocationData);

    await seedUsers(usersData);
    const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
    const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
    const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];
  
    adminToken = generateAuthHeader(adminData);
    readerToken = generateAuthHeader(readerData);
    technicianToken = generateAuthHeader(technicianData);
});
afterAll(async () => {
    await clearLocations();
    await clearManufacturers();
    await clearCategories();
    await clearComponents();
    await clearUsers();
});

describe('admin-only route protection', function() {
  const adminOnlyTestCases: {method: string, path: string}[] = [
    {method: 'post', path: '/api/locations'},
    {method: 'put', path: '/api/locations/:id'},
    {method: 'delete', path: '/api/locations/:id'}
  ];
  it.each(adminOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });

  it.each(adminOnlyTestCases)('%s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe("GET /locations", function() {
  it("should return a list of locations", function(done) {
    request(app)
      .get("/api/locations")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBeGreaterThan(0);
        expect(response.body.content[0]).toHaveProperty("id");
        expect(response.body.content[0]).toHaveProperty("name");
        expect(response.body.content[0]).toHaveProperty("path");
        done();
      })
      .catch(done);
  });

  describe("should have pagination", function(){
    it("should return three locations in first page", function(done) {
      request(app)
        .get("/api/locations?offset=0&limit=3")
        .set(readerToken)
        .expect(200)
        .then(function(response) {
          expect(response.body.content.length).toEqual(3);
          expect(response.body).toHaveProperty("pagination");
          expect(response.body).toHaveProperty("links");
          done();
        })
        .catch(done);
    });

    it("should return one location in last page", function(done) {
      request(app)
        .get("/api/locations?offset=3&limit=3")
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
  });
});

describe("GET /locations/:id", function() {
  it("should return location data", function(done) {
    const location = locationsData['Test Location'];
    request(app)
      .get(`/api/locations/${location.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content[0]).toHaveProperty("id", location.id);
        expect(response.body.content[0]).toHaveProperty("name", location.name);
        expect(response.body.content[0]).toHaveProperty("path", location.path);
        done();
      })
      .catch(done);
  });

  it("should reject an invalid location id", function(done) {
    request(app)
      .get("/api/locations/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a deleted location", function(done) {
    const location = locationsData['Deleted Location'];
    request(app)
      .get(`/api/locations/${location.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found for a nonexistent location", function(done) {
    request(app)
      .get("/api/locations/123456")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("GET /locations/:location_id/components", function() {
  it("should return components stocked at the location", function(done) {
    const location = locationsData['Test Location'];
    request(app)
      .get(`/api/locations/${location.id}/components`)
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content).toHaveLength(1);
        expect(response.body.content[0]).toHaveProperty("component_id", componentsData['Test Component'].id);
        expect(response.body.content[0]).toHaveProperty("component_name", componentsData['Test Component'].name);
        expect(response.body.content[0]).toHaveProperty("amount", 5);
        done();
      })
      .catch(done);
  });

  it("should reject an invalid location id", function(done) {
    request(app)
      .get("/api/locations/asd/components")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a nonexistent location", function(done) {
    request(app)
      .get("/api/locations/123/components")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content).toHaveLength(0);
        done();
      })
      .catch(done);
  });

  it("should return empty array for a deleted location", function(done) {
    const location = locationsData['Deleted Location'];
    request(app)
      .get(`/api/locations/${location.id}/components`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content).toHaveLength(0);
        done();
      })
      .catch(done);
  });
});

describe("POST /locations", function() {
  const newLocation = {name: 'New Location', description: 'New test location', path: 'New_Location'};

  it("should create a location", function(done) {
    request(app)
      .post("/api/locations")
      .send(newLocation)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data).toMatchObject(newLocation);
        done();
      })
      .catch(done);
  });

  it("should reject empty data", function(done) {
    request(app)
      .post("/api/locations")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("PUT /locations/:id", function() {
  it("should edit a location", function(done) {
    const location = locationsData['Test Sub-location'];
    const updatedLocation = {name: 'Updated Sub-location', description: 'Updated location', path: 'Test_Location.Updated_Sub_location'};
    request(app)
      .put(`/api/locations/${location.id}`)
      .send(updatedLocation)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data).toMatchObject(updatedLocation);
        done();
      })
      .catch(done);
  });

  it("should reject an invalid location id", function(done) {
    request(app)
      .put("/api/locations/asd")
      .send({name: 'Updated Location', path: 'Updated_Location'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a nonexistent location", function(done) {
    request(app)
      .put("/api/locations/123456")
      .send({name: 'Updated Location', path: 'Updated_Location'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found for a deleted location", function(done) {
    const location = locationsData['Deleted Location'];
    request(app)
      .put(`/api/locations/${location.id}`)
      .send({name: 'Updated Location', path: 'Updated_Location'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject empty data", function(done) {
    const location = locationsData['Test Location'];
    request(app)
      .put(`/api/locations/${location.id}`)
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("DELETE /locations/:id", function() {
  it("should delete a location", function(done) {
    const location = locationsData['Test Location 2'];
    request(app)
      .delete(`/api/locations/${location.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data).toHaveProperty("id", location.id);
        done();
      })
      .catch(done);
  });

  it("should return not found when deleting an already deleted location", function(done) {
    const location = locationsData['Deleted Location'];
    request(app)
      .delete(`/api/locations/${location.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when deleting a nonexistent location", function(done) {
    request(app)
      .delete("/api/locations/123456")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject invalid location id", function(done) {
    request(app)
      .delete("/api/locations/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});
