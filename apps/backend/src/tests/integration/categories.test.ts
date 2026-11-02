import app from "../../app";
import type { CategoryData } from "../../utils/schemas";
import { clearCategories, clearUsers, seedData, seedUsers, type TestData, type UserDataTest } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };
const categoryData: {[x: string]: CategoryData & TestData} = {
    'Test Category': {id: 0, name: 'Test Category', path: 'Test_Category'},
    'Test Subcategory': {id: 0, name: 'Test Subcategory', path: 'Test_Category.Test_Subcategory'},
    'Test Category 2': {id: 0, name: 'Test Category 2', path: 'Test_Category_2'},
    'Test Subcategory 2': {id: 0, name: 'Test Subcategory 2', path: 'Test_Category_2.Test_Subcategory_2'},
    'Deleted Category': {id: 0, name: 'Deleted Category', path: 'Deleted_Category', deleted_at: Date()}
};
const usersData: {[x: string]: UserDataTest} = {
    'admin@test.com': {id: 0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id: 0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id: 0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'}
};

beforeAll(async () => {
    await seedData('component_categories', categoryData);
    await seedUsers(usersData);
    const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
    const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
    const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];

    adminToken = generateAuthHeader(adminData);
    readerToken = generateAuthHeader(readerData);
    technicianToken = generateAuthHeader(technicianData);
});
afterAll(async () => {
    await clearCategories();
    await clearUsers();
});

describe('admin-only route protection', function() {
  const adminOnlyTestCases: {method: string, path: string}[] = [
    {method: 'post', path: '/api/component-categories'},
    {method: 'put', path: '/api/component-categories/:id'},
    {method: 'delete', path: '/api/component-categories/:id'}
  ];
  it.each(adminOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });

  it.each(adminOnlyTestCases)('%s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe("GET /component-categories", function() {
  it("should return a list of component categories", function(done) {
    request(app)
      .get("/api/component-categories")
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

  describe('should have pagination', function(){
    it("should return three categories on first page", function(done) {
      request(app)
        .get("/api/component-categories?offset=0&limit=3")
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

    it("should return one category on last page", function(done) {
      request(app)
        .get("/api/component-categories?offset=3&limit=3")
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

describe("GET /component-categories/children", function() {
  it("should return root categories when path is omitted", function(done) {
    request(app)
      .get("/api/component-categories/children")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.some((category: CategoryData & TestData) => category.id === categoryData['Test Category'].id)).toBe(true);
        done();
      })
      .catch(done);
  });

  it("should return descendants of the requested path", function(done) {
    request(app)
      .get("/api/component-categories/children?path=Test_Category")
      .set(readerToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.some((category: CategoryData & TestData) => category.id === categoryData['Test Subcategory'].id)).toBe(true);
        done();
      })
      .catch(done);
  });

  it("should return empty array when fetching a deleted category", function(done) {
    request(app)
      .get("/api/component-categories/children?path=Deleted_Category")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBe(0);
        done();
      })
      .catch(done);
  });

  it("should return empty array when fetching a nonexistent category", function(done) {
    request(app)
      .get("/api/component-categories/children?path=asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(Array.isArray(response.body.content)).toBe(true);
        expect(response.body.content.length).toBe(0);
        done();
      })
      .catch(done);
  });
});

describe("GET /component-categories/:id", function() {
  it("should return component category data", function(done) {
    const category = categoryData['Test Category'];
    request(app)
      .get(`/api/component-categories/${category.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.content[0]).toHaveProperty("id", category.id);
        expect(response.body.content[0]).toHaveProperty("name", category.name);
        expect(response.body.content[0]).toHaveProperty("path", category.path);
        done();
      })
      .catch(done);
  });

  it("should reject an invalid category id", function(done) {
    request(app)
      .get("/api/component-categories/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a deleted category", function(done) {
    const category = categoryData['Deleted Category'];
    request(app)
      .get(`/api/component-categories/${category.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found for a nonexistent category", function(done) {
    request(app)
      .get("/api/component-categories/123456")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });
});

describe("POST /component-categories", function() {
  it("should create a component category", function(done) {
    const newCategory = {name: 'New Category', path: 'New_Category'};
    request(app)
      .post("/api/component-categories")
      .send(newCategory)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toMatchObject(newCategory);
        done();
      })
      .catch(done);
  });

  it("should reject duplicated path", function(done) {
    request(app)
      .post("/api/component-categories")
      .send({name: 'Test Category', path: 'Test_Category'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(409, done);
  });

  it("should reject empty data", function(done) {
    request(app)
      .post("/api/component-categories")
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("PUT /component-categories/:id", function() {
  it("should update a component category", function(done) {
    const category = categoryData['Test Subcategory'];
    const updatedCategory = {name: 'Updated Subcategory', path: 'Test_Category.Updated_Subcategory'};
    request(app)
      .put(`/api/component-categories/${category.id}`)
      .send(updatedCategory)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body).toHaveProperty("message");
        expect(response.body.data[0]).toMatchObject(updatedCategory);
        done();
      })
      .catch(done);
  });

  it("should reject duplicated path", function(done) {
    const category = categoryData['Test Subcategory'];
    const updatedCategory = {name: 'Updated Subcategory', path: 'Test_Category_2.Test_Subcategory_2'};
    request(app)
      .put(`/api/component-categories/${category.id}`)
      .send(updatedCategory)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(409, done);
  });

  it("should reject an invalid category id", function(done) {
    request(app)
      .put("/api/component-categories/asd")
      .send({name: 'Updated Subcategory', path: 'Updated_Subcategory'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });

  it("should return not found for a nonexistent category", function(done) {
    request(app)
      .put("/api/component-categories/123456")
      .send({name: 'Updated Subcategory', path: 'Updated_Subcategory'})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found for a deleted category", function(done) {
    const category = categoryData['Deleted Category'];
    const updatedCategory = {name: 'Updated Subcategory', path: 'Test_Category.Updated_Subcategory'};
    request(app)
      .put(`/api/component-categories/${category.id}`)
      .send(updatedCategory)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject empty data", function(done) {
    const category = categoryData['Test Category'];
    request(app)
      .put(`/api/component-categories/${category.id}`)
      .send({})
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});

describe("DELETE /component-categories/:id", function() {
  it("should delete a component category", function(done) {
    const category = categoryData['Test Category 2'];
    request(app)
      .delete(`/api/component-categories/${category.id}`)
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
  
  it("should return not found when deleting an already deleted category", function(done) {
    const category = categoryData['Deleted Category'];
    request(app)
      .delete(`/api/component-categories/${category.id}`)
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should return not found when deleting a nonexistent category", function(done) {
    request(app)
      .delete("/api/component-categories/123456")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(404, done);
  });

  it("should reject invalid category id", function(done) {
    request(app)
      .delete("/api/component-categories/asd")
      .set(adminToken)
      .expect("Content-Type", /json/)
      .expect(422, done);
  });
});
