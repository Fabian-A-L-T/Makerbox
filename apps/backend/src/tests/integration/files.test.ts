import app from "../../app";
import fs from 'node:fs/promises';
import { clearUsers, seedUsers, type UserDataTest } from "../db/seeder";
import { generateAuthHeader } from "../helpers/auth";
import request from 'supertest';

let adminToken: { Authorization: string };
let readerToken: { Authorization: string };
let technicianToken: { Authorization: string };
const uploadedFiles: string[] = [];

const adminOnlyTestCases: {method: string, path: string}[] = [
  {method: 'post', path: '/api/files/upload/image'},
  {method: 'post', path: '/api/files/upload/document'},
  {method: 'post', path: '/api/files/delete'}
];

const usersData: {[x: string]: UserDataTest} = {
    'admin@test.com': {id: 0, name: 'Admin user', email: 'admin@test.com', passwd: 'adminPass', role: 'admin'},
    'reader@test.com': {id: 0, name: 'Reader user', email: 'reader@test.com', passwd: 'readerPass', role: 'reader'},
    'technician@test.com': {id: 0, name: 'Technician user', email: 'technician@test.com', passwd: 'technicianPass', role: 'technician'}
};

beforeAll(async () => {
  await clearUsers();

  await seedUsers(usersData);
  const {passwd: passwdA, deleted_at: deleted_atA, ...adminData} = usersData['admin@test.com'];
  const {passwd: passwdR, deleted_at: deleted_atR, ...readerData} = usersData['reader@test.com'];
  const {passwd: passwdT, deleted_at: deleted_atT, ...technicianData} = usersData['technician@test.com'];

  adminToken = generateAuthHeader(adminData);
  readerToken = generateAuthHeader(readerData);
  technicianToken = generateAuthHeader(technicianData);
});
afterAll(async () => {
  await Promise.all(uploadedFiles.map(file => fs.unlink(file).catch(() => undefined)));
  await clearUsers();
});

describe('admin-only route protection', function() {
  it.each(adminOnlyTestCases)('%s rejects reader users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(readerToken).expect(403, done);
  });

  it.each(adminOnlyTestCases)('%s rejects technician users', ({method, path}, done: any) => {
    request(app)[method as 'post'](path).set(technicianToken).expect(403, done);
  });
});

describe("POST /files/upload/image", function() {
  it("should upload an image", function(done) {
    request(app)
      .post("/api/files/upload/image")
      .set(adminToken)
      .attach('images', Buffer.from('test image content'), {filename: 'integration-image.png', contentType: 'image/png'})
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.url).toMatch(/^uploads[\\/]images[\\/]/);
        uploadedFiles.push(response.body.url);
        done();
      })
      .catch(done);
  });

  it("should reject requests without a file", function(done) {
    request(app)
      .post("/api/files/upload/image")
      .set(adminToken)
      .expect(400, done);
  });
});

describe("POST /files/upload/document", function() {
  it("should upload a document", function(done) {
    request(app)
      .post("/api/files/upload/document")
      .set(adminToken)
      .attach('documents', Buffer.from('test document content'), {filename: 'integration-document.pdf', contentType: 'application/pdf'})
      .expect("Content-Type", /json/)
      .expect(200)
      .then(function(response) {
        expect(response.body.url).toMatch(/^uploads[\\/]documents[\\/]/);
        uploadedFiles.push(response.body.url);
        done();
      })
      .catch(done);
  });

  it("should reject requests without a file", function(done) {
    request(app)
      .post("/api/files/upload/document")
      .set(adminToken)
      .expect(400, done);
  });
});

describe("POST /files/delete", function() {
  it("should delete an uploaded file", function(done) {
    request(app)
      .post("/api/files/upload/document")
      .set(adminToken)
      .attach('documents', Buffer.from('file to delete'), {filename: 'integration-delete.pdf', contentType: 'application/pdf'})
      .expect(200)
      .then(function(uploadResponse) {
        const fileUrl = uploadResponse.body.url as string;
        uploadedFiles.push(fileUrl);
        request(app)
          .post("/api/files/delete")
          .send({fileUrl})
          .set(adminToken)
          .expect("Content-Type", /json/)
          .expect(200)
          .then(function(response) {
            expect(response.body).toHaveProperty("message", "File deleted successfully");
            done();
          })
          .catch(done);
      })
      .catch(done);
  });

  it("should reject an invalid file URL", function(done) {
    request(app)
      .post("/api/files/delete")
      .send({fileUrl: '../outside-file'})
      .set(adminToken)
      .expect(400, done);
  });
});
