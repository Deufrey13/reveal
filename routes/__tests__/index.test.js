// ressource pour les tests: https://dev.to/ryuuto829/setup-in-memory-database-for-testing-node-js-and-mongoose-1kop

const app = require('../../app');
const request = require('supertest');
const db = require('../db-tests');

// Pass supertest agent for each test
const agent = request.agent(app);

// Setup connection to the database
beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());


describe('Batches tests', () => {
  test('Try get batches - wrong school ID', async () => {
    const expectedResponse = {
      success: false,
      message: 'no template or no school for this school id'
    }

    const response = await agent
      .get('/batch?school_id=000000000000000000000000')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toMatchObject(expectedResponse);
  })

  test('Create new batches and get it', async () => {
    // 1 - Create batches
    const response1 = await agent
      .post('/create-batch')
      .send({
        year: 1901,
        curriculum: 'Test_Course_1',
        promo: '100',
        school_id: '611e827809c6d60015b9fcec'
      })
      .expect(200)

    expect(response1.body.result).toBeTruthy();

    // 2.1 - get one batch
    const response2 = await agent
      .get("/get-batch?batch_curriculum_year=Test_Course_1-1901")
      .expect(200)
    
    expect(response2.body.batch._id).toBeTruthy();
    
    await agent
      .post('/create-batch')
      .send({
        year: 1902,
        curriculum: 'Test_Course_2',
        promo: '200',
        school_id: '611e827809c6d60015b9fcec'
      });
    
    // 2.2 - get all batches of a school
    const response3 = await agent
      .get('/batch?school_id=611e827809c6d60015b9fcec')
      .expect(200)

    expect(response3.body.batches.length).toBe(2);
  })
});


test('get-school test, should return a fail message', async () => {
  const expectedResponse = { result: false, msg: "Ecole non existante" };

  const response = await agent
    .get('/get-school?school_id=000000000000000000000000')
    .expect(200)

  expect(response.body).toEqual(expectedResponse);
})

test('student test, should return a fail message', async () => {
  const expectedResponse = { result: false, msg: "Etudiant non existant" };

  const response = await agent
    .get('/get-student?student_name=first-last')
    .expect(200)

  expect(response.body).toEqual(expectedResponse);
})