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
  await clearUsers()
  
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
  it("should accept technician users", function(done) {
    request(app)
      .get("/api/stats/components")
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
  it("should accept reader users", function(done) {
    request(app)
      .get("/api/stats/components")
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
});

describe("GET /stats/tools", function() {
  it("should return tool statistics", function(done) {
    request(app)
      .get("/api/stats/tools")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        done();
      })
      .catch(done);
  });
  it("should accept technician users", function(done) {
    request(app)
      .get("/api/stats/tools")
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200,done);
  });
  it("should accept reader users", function(done) {
    request(app)
      .get("/api/stats/tools")
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200,done);
  });
});

describe("GET /stats/projects/global", function() {
  it("should return global project statistics", function(done) {
    request(app)
      .get("/api/stats/projects/global")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        done();
      })
      .catch(done);
  });
  it("should reject technician users", function(done) {
    request(app)
      .get("/api/stats/projects/global")
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(403, done);
  });
  it("should reject reader users", function(done) {
    request(app)
      .get("/api/stats/projects/global")
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(403, done);
  });
});

describe("GET /stats/projects/user", function() {
  it("should return user project statistics", function(done) {
    request(app)
      .get("/api/stats/projects/user")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        done();
      })
      .catch(done);
  });
  it("should accept technician users", function(done) {
    request(app)
      .get("/api/stats/projects/user")
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
  it("should reject reader users", function(done) {
    request(app)
      .get("/api/stats/projects/user")
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(403, done);
  });
});

describe("stats route authentication", function() {
  it("should reject requests without an authorization token (component stats)", function(done) {
    request(app)
      .get("/api/stats/components")
      .expect(401, done);
  });
  it("should reject requests without an authorization token (tool stats)", function(done) {
    request(app)
      .get("/api/stats/tools")
      .expect(401, done);
  });
  it("should reject requests without an authorization token (global project stats)", function(done) {
    request(app)
      .get("/api/stats/projects/global")
      .expect(401, done);
  });
  it("should reject requests without an authorization token (user project stats)", function(done) {
    request(app)
      .get("/api/stats/projects/user")
      .expect(401, done);
  });
});
