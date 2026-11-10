import app from "../../app";
import type { UserData } from "../../utils/schemas";
import { clearUsers, seedUsers, type TestData } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };

const usersData: {[x: string]: UserData & TestData & {role: "admin" | "technician" | "reader"}} = {
    'admin@test.com': {id:0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'}
};
const refreshCookie = (response: request.Response) => response.headers['set-cookie'][0].split(';')[0];

beforeAll(async () => {
  await clearUsers();
  await seedUsers(usersData);
  const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];

  adminToken = generateAuthHeader(adminData);
});
afterAll(async () => {
  await clearUsers();
});

describe("POST /auth/login", function() {
  it("should return an access token and refresh cookie", function(done) {
    request(app).post("/api/auth/login")
      .send({email: usersData['admin@test.com'].email, passwd: usersData['admin@test.com'].passwd, remember: 'true'})
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.userData).toMatchObject({email: 'admin@test.com', role: 'admin'});
        expect(response.headers['set-cookie'][0]).toMatch(/^refresh_token=/);
        done();
      })
      .catch(done);
  });

  it("should reject invalid credentials", function(done) {
    request(app).post("/api/auth/login")
      .send({email: usersData['admin@test.com'].email, passwd: 'wrongPassword'})
      .expect("Content-Type", /json/)
      .expect(422,done);
  });

  it("should reject an unknown email", function(done) {
    request(app).post("/api/auth/login")
      .send({email: 'missing@auth.test', passwd: 'validPassword'})
      .expect(404,done);
  });
});

describe("POST /auth/refresh", function() {
  it("should rotate the refresh token and return a new access token", async function() {
    const loginResponse = await request(app).post("/api/auth/login")
      .send({email: usersData['admin@test.com'].email, passwd: usersData['admin@test.com'].passwd})
      .expect(200);

    const response = await request(app).post("/api/auth/refresh")
      .set('Cookie', loginResponse.headers['set-cookie'][0].split(';')[0])
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.userData).toMatchObject({email: usersData['admin@test.com'].email, role: 'admin'});
    expect(response.headers['set-cookie'][0]).toMatch(/^refresh_token=/);
  });

  it("should reject a request without a refresh cookie", function(done) {
    request(app).post("/api/auth/refresh")
      .expect("Content-Type", /json/)
      .expect(401,done);
  });
});

describe("POST /auth/logout", function() {
  it("should clear the refresh cookie", async function() {
    const loginResponse = await request(app).post("/api/auth/login")
      .send({email: usersData['admin@test.com'].email, passwd: usersData['admin@test.com'].passwd})
      .expect(200);

    const response = await request(app).post("/api/auth/logout")
      .set(adminToken)
      .set('Cookie', refreshCookie(loginResponse))
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.headers['set-cookie'][0]).toMatch(/^refresh_token=;/);
  });

  it("should reject a request without a refresh cookie", function(done) {
    request(app).post("/api/auth/logout").set(adminToken).expect(401,done);
  });
});

describe("GET /auth/validate", function() {
  it("should return the authenticated user", function(done) {
    request(app).get("/api/auth/validate")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toMatchObject({valid: true, user: {email: usersData['admin@test.com'].email, role: 'admin'}});
        done();
      })
      .catch(done);
  });

  it("should reject a request without an access token", function(done) {
    request(app).get("/api/auth/validate").expect(401,done);
  });
});
