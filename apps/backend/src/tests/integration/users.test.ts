import request from 'supertest';
import app from '../../app';
import { clearUsers, seedUsers, type UserDataTest } from '../db/seeder';
import { generateAuthHeader, generateToken } from '../helpers/auth';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };
let testToken: { Authorization: string };

const usersData: {[x: string]: UserDataTest} = {
    'admin@test.com': {id:0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id:0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id:0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'},
    'test@test.com': {id:0, name: 'Test user', email: 'test@test.com', passwd: 'testPass', role: 'admin'},
    'admind@test.com': {id:0, name: 'Deleted Admin user', email: 'admind@test.com', passwd: 'adminPass', role: 'admin', deleted_at: Date()},
};

beforeAll(async () => {
  await seedUsers(usersData);
  const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
  const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
  const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];
  const {passwd: passwdS, deleted_at: deleted_atS, ...testData} = usersData['test@test.com'];

  adminToken = generateAuthHeader(adminData);
  readerToken = generateAuthHeader(readerData);
  technicianToken = generateAuthHeader(technicianData);
  testToken = generateAuthHeader(testData);
});
afterAll(async () => await clearUsers());

describe('admin-only route protection', function() {
  const adminOnlyTestCases: {method: string, path: string}[] = [
    {method: 'get', path: '/api/users'},
    {method: 'get', path: '/api/users/:id'},
    {method: 'post', path: '/api/users'},
    {method: 'put', path: '/api/users/:id'},
    {method: 'delete', path: '/api/users/:id'},
    {method: 'put', path: '/api/users/:id/restore'}
  ];
  it.each(adminOnlyTestCases)('%s %s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });

  it.each(adminOnlyTestCases)('%s %s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe("GET /users", function() {
  it("should return a list of users", function(done) {
    request(app)
      .get("/api/users")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBeGreaterThan(0);
        expect(response.body.content[0]).toHaveProperty("id");
        expect(response.body.content[0]).toHaveProperty("name");
        expect(response.body.content[0]).toHaveProperty("email");
        expect(response.body.content[0]).toHaveProperty("role");
        expect(response.body.content[0]).not.toHaveProperty("passwd");
        expect(response.body.content[0]).not.toHaveProperty("created_at");
        expect(response.body.content[0]).not.toHaveProperty("updated_at");
        expect(response.body.content[0]).not.toHaveProperty("deleted_at");
        done();
      })
      .catch(done);
  });

  describe('should have pagination', function(){
    it("should return three users in first page", function(done) {
      request(app)
        .get("/api/users?offset=0&limit=3")
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
    it("should return one user in last page", function(done) {
      request(app)
        .get("/api/users?offset=3&limit=3")
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
  });
});

describe("GET /users/:id", function() {
  it("should return user data", function(done) {
    const technicianUser = usersData['technician@test.com'];
    request(app)
      .get(`/api/users/${technicianUser.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content).toEqual({
          id: technicianUser.id, 
          name: technicianUser.name, 
          email: 'technician@test.com', 
          role: technicianUser.role});
        done();
      })
      .catch(done);
  });

  it("reject invalid user id", function(done) {
    request(app)
      .get("/api/users/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found when fetching a deleted user", function(done) {
    const deletedUser = usersData['admind@test.com'];
    request(app)
      .get(`/api/users/${deletedUser.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when fetching a nonexistent user", function(done) {
    request(app)
      .get("/api/users/123")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("POST /users", function() {
  const userData = {name: 'New user', email: 'new@test.com', role: 'admin', passwd: '123asdasd'};

  it("should create a user", function(done) {
    request(app)
      .post("/api/users")
      .send(userData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: userData.name, email: userData.email, role: userData.role, id: response.body.data.id});
        done();
      })
      .catch(done);
  });

  it("should reject empty data", function(done) {
    request(app)
      .post("/api/users")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject invalid email", function(done) {
    request(app)
      .post("/api/users")
      .send({...userData, email: "asd"})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject short name", function(done) {
    request(app)
      .post("/api/users")
      .send({...userData, name: "a"})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject long name", function(done) {
    request(app)
      .post("/api/users")
      .send({...userData, name: "qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopq"})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject short password (less than 8 chars)", function(done) {
    request(app)
      .post("/api/users")
      .send({...userData, passwd: "123"})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject long password (more than 64 chars)", function(done) {
    request(app)
      .post("/api/users")
      .send({...userData, passwd: "1234567890123456789012345678901234567890123456789012345678901234567890"})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject wrong role", function(done) {
    request(app)
      .post("/api/users")
      .send({...userData, role: "tester"})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should reject duplicated email", function(done) {
    request(app)
      .post("/api/users")
      .send({...userData, email: "admin@test.com"})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(409, done);
  });
});

describe("PUT /users/:id", function() {
  const userData = {name: 'New user', email: 'new@test.com', role: 'reader', passwd: '123asdasd'};

  it("should update a user role", function(done) {
    const testUser = usersData['test@test.com'];
    request(app)
      .put(`/api/users/${testUser.id}`)
      .send(userData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: testUser.name, email: testUser.email, role: userData.role, id: testUser.id});
        done();
      })
      .catch(done);
  });

  it("should reject invalid user id", function(done) {
    request(app)
      .put("/api/users/asd")
      .send(userData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found when updating nonexistent user", function(done) {
    request(app)
      .put("/api/users/123")
      .send(userData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when updating deleted user", function(done) {
    const deletedUser = usersData['admind@test.com'];
    request(app)
      .put(`/api/users/${deletedUser.id}`)
      .send(userData)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject missing data", function(done) {
    request(app)
      .put("/api/users/2")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("DELETE /users/:id", function() {
  it("should delete a user", function(done) {
    const testUser = usersData['test@test.com'];
    request(app)
      .delete(`/api/users/${testUser.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: testUser.name, email: testUser.email, role: 'reader', id: testUser.id});
        done();
      })
      .catch(done);
  });

  it("should return not found when deleting an already deleted user", function(done) {
    const testUser = usersData['test@test.com'];
    request(app)
      .delete(`/api/users/${testUser.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when deleting a nonexistent user", function(done) {
    request(app)
      .delete("/api/users/123")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject invalid user id", function(done) {
    request(app)
      .delete("/api/users/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("PUT /users/:id/restore", function() {
  it("should restore a deleted user", function(done) {
    const testUser = usersData['test@test.com'];
    request(app)
      .put(`/api/users/${testUser.id}/restore`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: testUser.name, email: testUser.email, role: 'reader', id: testUser.id});
        done();
      })
      .catch(done);
  });

  it("should return not found when restoring active user", function(done) {
    const activeUser = usersData['reader@test.com'];
    request(app)
      .put(`/api/users/${activeUser.id}/restore`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when restoring nonexistent user", function(done) {
    request(app)
      .put("/api/users/123/restore")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject invalid user id", function(done) {
    request(app)
      .put("/api/users/asd/restore")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("PUT /users/profile", function() {
  const userData = {name: 'New name'};

  it("should update a user name", function(done) {
    const testUser = usersData['test@test.com'];
    request(app)
      .put("/api/users/profile")
      .send(userData)
      .set(testToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: userData.name, email: testUser.email, role: 'reader', id: testUser.id});
        done();
      })
      .catch(done);
  });

  it("should return not found when updating nonexistent user", function(done) {
    request(app)
      .put("/api/users/profile")
      .send(userData)
      .set('Authorization', `Bearer ${generateToken({id: 123, name: 'Test User', email: 'test@test.com', role: 'admin'})}`)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when updating deleted user", function(done) {
    const deletedUser = usersData['admind@test.com'];
    request(app)
      .put("/api/users/profile")
      .send(userData)
      .set('Authorization', `Bearer ${generateToken({id: deletedUser.id, name: 'Test User', email: 'test@test.com', role: 'admin'})}`)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should let reader users update their name", function(done) {
    const readerUser = usersData['reader@test.com'];
    request(app)
      .put("/api/users/profile")
      .send(userData)
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: userData.name, email: readerUser.email, role: readerUser.role, id: readerUser.id});
        done();
      })
      .catch(done);
  });

  it("should let technician users update their name", function(done) {
    const technicianUser = usersData['technician@test.com'];
    request(app)
      .put("/api/users/profile")
      .send(userData)
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: userData.name, email: technicianUser.email, role: technicianUser.role, id: technicianUser.id});
        done();
      })
      .catch(done);
  });
});

describe("PATCH /users/profile/email", function() {
  it("should update a user email", function(done) {
    const testUser = usersData['test@test.com'];
    request(app)
      .patch("/api/users/profile/email")
      .send({email: 'newemail@test.com', passwd: testUser.passwd})
      .set(testToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: 'New name', email: 'newemail@test.com', role: 'reader', id: testUser.id});
        done();
      })
      .catch(done);
  });

  it("should return unauthorized when sending wrong password", function(done) {
    request(app)
      .patch("/api/users/profile/email")
      .send({email: 'newemail@test.com', passwd: "12345678"})
      .set(testToken)
      .expect("Content-Type", /json/)
      .expect(401, done);
  });

  it("should reject duplicated email", function(done) {
    const testUser = usersData['test@test.com'];
    request(app)
      .patch("/api/users/profile/email")
      .send({passwd: testUser.passwd, email: 'admin@test.com'})
      .set(testToken)
      .expect("Content-Type", /json/)
      .expect(409, done);
  });

  it("should return not found when updating nonexistent user", function(done) {
    request(app)
      .patch("/api/users/profile/email")
      .send({passwd: '12345678', email: 'test@test.com'})
      .set('Authorization', `Bearer ${generateToken({id: 123, name: 'Test User', email: 'test@test.com', role: 'admin'})}`)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should let reader users update their email", function(done) {
    const readerUser = usersData['reader@test.com'];
    request(app)
      .patch("/api/users/profile/email")
      .send({passwd: readerUser.passwd, email: 'newreader@test.com'})
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: 'New name', email: 'newreader@test.com', role: 'reader', id: readerUser.id});
        done();
      })
      .catch(done);
  });

  it("should let technician users update their email", function(done) {
    const technicianUser = usersData['technician@test.com'];
    request(app)
      .patch("/api/users/profile/email")
      .send({passwd: technicianUser.passwd, email: 'newtechnician@test.com'})
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: 'New name', email: 'newtechnician@test.com', role: 'technician', id: technicianUser.id});
        done();
      })
      .catch(done);
  });
});

describe("PATCH /users/profile/password", function() {
  it("should update a user password", function(done) {
    const testUser = usersData['test@test.com'];
    request(app)
      .patch("/api/users/profile/password")
      .send({passwd: testUser.passwd, new_passwd: 'newPassword'})
      .set(testToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: 'New name', email: 'newemail@test.com', role: 'reader', id: testUser.id});
        done();
      })
      .catch(done);
  });

  it("should return unauthorized when sending wrong password", function(done) {
    request(app)
      .patch("/api/users/profile/password")
      .send({passwd: "12345678", new_passwd: 'newPassword'})
      .set(testToken)
      .expect("Content-Type", /json/)
      .expect(401, done);
  });

  it("should return not found when updating nonexistent user", function(done) {
    request(app)
      .patch("/api/users/profile/password")
      .send({passwd: '12345678', new_passwd: 'newPassword'})
      .set('Authorization', `Bearer ${generateToken({id: 123, name: 'Test User', email: 'test@test.com', role: 'admin'})}`)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should let reader users update their password", function(done) {
    const readerUser = usersData['reader@test.com'];
    request(app)
      .patch("/api/users/profile/password")
      .send({passwd: readerUser.passwd, new_passwd: 'newPassword'})
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: 'New name', email: 'newreader@test.com', role: 'reader', id: readerUser.id});
        done();
      })
      .catch(done);
  });

  it("should let technician users update their password", function(done) {
    const technicianUser = usersData['technician@test.com'];
    request(app)
      .patch("/api/users/profile/password")
      .send({passwd: technicianUser.passwd, new_passwd: 'newPassword'})
      .set(technicianToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({name: 'New name', email: 'newtechnician@test.com', role: 'technician', id: technicianUser.id});
        done();
      })
      .catch(done);
  });
});
