import app from "../../app";
import { clearUsers, seedUsers, updateStatViews, type UserDataTest } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };

const usersData: {[x: string]: UserDataTest} = {
  'admin@test.com': {id: 0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
  'reader@test.com': {id: 0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
  'technician@test.com': {id: 0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'}
};

beforeAll(async () => {
  await updateStatViews();
  await seedUsers(usersData);
  const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
  const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
  const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];

  adminToken = generateAuthHeader(adminData);
  readerToken = generateAuthHeader(readerData);
  technicianToken = generateAuthHeader(technicianData);
});
afterAll(async () => await clearUsers());

describe("GET /stats/components", function() {
  it("should return component statistics", function(done) {
    request(app)
      .get("/api/stats/components")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        done();
      })
      .catch(done);
  });
});

describe("GET /stats/tools", function() {
  it("should return tool statistics", function(done) {
    request(app)
      .get("/api/stats/tools")
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        done();
      })
      .catch(done);
  });
});

describe("GET /stats/projects", function() {
  it("should return project statistics", function(done) {
    request(app)
      .get("/api/stats/projects")
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        done();
      })
      .catch(done);
  });
});

describe("stats route authentication", function() {
  it("should reject requests without an authorization token", function(done) {
    request(app)
      .get("/api/stats/components")
      .expect(401, done);
  });
});
