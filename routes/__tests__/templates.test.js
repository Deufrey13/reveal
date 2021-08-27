// ressource pour les tests: https://dev.to/ryuuto829/setup-in-memory-database-for-testing-node-js-and-mongoose-1kop

const app = require('../../app');
const request = require('supertest');
const db = require('../db-tests');
const { post } = require('..');

// Pass supertest agent for each test
const agent = request.agent(app);

// Setup connection to the database
beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());


describe('Templates tests', () => {
  test('should create a template', async () => {
    // arrange
    const schoolResp = await agent
      .post('/schools/create')
      .send({ schoolName: 'Test_School' })
      .expect(200);
    
    const schoolId = schoolResp.body.schools[0]._id;


    const fakeFields = {
      qrcode_field: {isFake: true},
      firstname_field: {isFake: true},
      lastname_field: {isFake: true},
      year_field: {isFake: true},
    }

    // act
    // Create
    const response = await agent
      .post(`/templates/create/${schoolId}`)
      .send({ 
        update: false,
        template_name: 'template_Test',
        template: {
          ...fakeFields,
          template_name: 'template_Test',
          background_image_field: {
            imagePreview: '/cloudinary'
          },
          static_fields: []
        }
      })
      .expect(200);

    expect(response.body.result).toBeTruthy();
  })

  /* test('should return all created school, edit 3rd school then delete it', async () => {
    await agent
      .post('/schools/create')
      .send({ schoolName: 'Test_School_1' })
      .expect(200);

    await agent
      .post('/schools/create')
      .send({ schoolName: 'Test_School_2' })
      .expect(200);
      
    const response = await agent
      .post('/schools/create')
      .send({ schoolName: 'Test_School_3' })
      .expect(200);
      
    const thirdSchoolId = response.body.schools[2]._id;
      
    // 1 - return all schools
    const allResponse = await agent
      .get('/schools/all')
      .expect(200)
      
    expect(allResponse.body.schools.length).toBe(3);

    // 2 - edit 3rd school
    const editResponse = await agent
      .post(`/schools/edit/${thirdSchoolId}`)
      .send({ schoolName: 'Test_School_3_Edited' })
      .expect(200)
    
    expect(editResponse.body.schools[2].name).toBe('Test_School_3_Edited');

    // 3 - delete 3rd school
    const deleteResponse = await agent
      .delete(`/schools/delete/${thirdSchoolId}`)
      .expect(200)
    
    expect(deleteResponse.body.schools.length).toBe(2);

    // 4 - Try delete 3rd school again
    const againResponse = await agent
      .delete(`/schools/delete/${thirdSchoolId}`)
      .expect(200)
    
    expect(againResponse.body.result).not.toBeTruthy();
    }) */
});