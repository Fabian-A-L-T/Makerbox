import app from "../../app";
import type { ManufacturerData } from "../../utils/schemas";
import { clearManufacturers, clearUsers, seedData, seedUsers, type TestData, type UserDataTest } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };
const manufacturersData: {[x: string]: ManufacturerData & TestData} = {
    'Test Manufacturer 1': {id: 0, name: 'Test Manufacturer 1', website: 'https://example.test'},
    'Test Manufacturer 2': {id: 0, name: 'Test Manufacturer 2', website: 'https://example.test'},
    'Test Manufacturer 3': {id: 0, name: 'Test Manufacturer 3', website: 'https://example.test'},
    'Deleted Manufacturer': {id: 0, name: 'Deleted Manufacturer', website: 'https://delete.example.test', deleted_at: Date()}
};
const usersData: {[x: string]: UserDataTest} = {
    'admin@test.com': {id: 0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id: 0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id: 0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'}
};

beforeAll(async () => {
  await clearManufacturers();
  await clearUsers();

  await seedData('manufacturers', manufacturersData);
  await seedUsers(usersData);
  const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
  const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
  const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];

  adminToken = generateAuthHeader(adminData);
  readerToken = generateAuthHeader(readerData);
  technicianToken = generateAuthHeader(technicianData);
});
afterAll(async () => {
  await clearManufacturers();
  await clearUsers();
});

describe('admin-only route protection', function() {
  const adminOnlyTestCases: {method: string, path: string}[] = [
    {method: 'post', path: '/api/manufacturers'},
    {method: 'put', path: '/api/manufacturers/:id'},
    {method: 'delete', path: '/api/manufacturers/:id'}
  ];
  it.each(adminOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });

  it.each(adminOnlyTestCases)('%s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe("GET /manufacturers", function() {
  it("should return a list of manufacturers", function(done) {
    request(app)
      .get("/api/manufacturers")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBeGreaterThan(0);
        expect(response.body.content[0]).toHaveProperty("id");
        expect(response.body.content[0]).toHaveProperty("name");
        expect(response.body.content[0]).toHaveProperty("website");
        done();
      })
      .catch(done);
  });

  describe("should have pagination", function(){
    it("should return two manufacturers in first page", function(done) {
      request(app)
        .get("/api/manufacturers?offset=0&limit=2")
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
    it("should return one manufacturer in last page", function(done) {
      request(app)
        .get("/api/manufacturers?offset=2&limit=2")
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

describe("GET /manufacturers/:id", function() {
  it("should return manufacturer data", function(done) {
    const manufacturer = manufacturersData['Test Manufacturer 1'];
    request(app)
      .get(`/api/manufacturers/${manufacturer.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content[0]).toHaveProperty("id", manufacturer.id);
        expect(response.body.content[0]).toHaveProperty("name", manufacturer.name);
        expect(response.body.content[0]).toHaveProperty("website", manufacturer.website);
        done();
      })
      .catch(done);
  });

  it("should reject an invalid manufacturer id", function(done) {
    request(app)
      .get("/api/manufacturers/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a deleted manufacturer", function(done) {
    const manufacturer = manufacturersData['Deleted Manufacturer'];
    request(app)
      .get(`/api/manufacturers/${manufacturer.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found for a nonexistent manufacturer", function(done) {
    request(app)
      .get("/api/manufacturers/123456")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("POST /manufacturers", function() {
  const newManufacturer = {name: 'New Manufacturer', website: 'https://new.example.test'};

  it("should create a manufacturer", function(done) {
    request(app)
      .post("/api/manufacturers")
      .send(newManufacturer)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data[0]).toMatchObject(newManufacturer);
        done();
      })
      .catch(done);
  });

  it("should reject empty data", function(done) {
    request(app)
      .post("/api/manufacturers")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("PUT /manufacturers/:id", function() {
  it("should edit a manufacturer", function(done) {
    const manufacturer = manufacturersData['Test Manufacturer 2'];
    const updatedManufacturer = {name: 'Updated Manufacturer', website: 'https://updated.example.test'};
    request(app)
      .put(`/api/manufacturers/${manufacturer.id}`)
      .send(updatedManufacturer)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data[0]).toMatchObject(updatedManufacturer);
        done();
      })
      .catch(done);
  });

  it("should reject an invalid manufacturer id", function(done) {
    request(app)
      .put("/api/manufacturers/asd")
      .send({name: 'Updated Manufacturer'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a deleted manufacturer", function(done) {
    const manufacturer = manufacturersData['Deleted Manufacturer'];
    request(app)
      .put(`/api/manufacturers/${manufacturer.id}`)
      .send({name: 'Updated Manufacturer'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found for a nonexistent manufacturer", function(done) {
    request(app)
      .put("/api/manufacturers/123456")
      .send({name: 'Updated Manufacturer'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject empty data", function(done) {
    const manufacturer = manufacturersData['Test Manufacturer 1'];
    request(app)
      .put(`/api/manufacturers/${manufacturer.id}`)
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("DELETE /manufacturers/:id", function() {
  it("should delete a manufacturer", function(done) {
    const manufacturer = manufacturersData['Test Manufacturer 1'];
    request(app)
      .delete(`/api/manufacturers/${manufacturer.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data[0]).toHaveProperty("id", manufacturer.id);
        done();
      })
      .catch(done);
  });

  it("should return not found when deleting an already deleted manufacturer", function(done) {
    const manufacturer = manufacturersData['Deleted Manufacturer'];
    request(app)
      .delete(`/api/manufacturers/${manufacturer.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when deleting a nonexistent manufacturer", function(done) {
    request(app)
      .delete("/api/manufacturers/123456")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject invalid manufacturer id", function(done) {
    request(app)
      .delete("/api/manufacturers/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});
