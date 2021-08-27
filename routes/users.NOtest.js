var app = require("../app")
var request = require("supertest")
const {MongoClient} = require('mongodb');

let connection;
let db;

beforeAll(async () => {
  connection = await MongoClient.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  db = await connection.db();
  
});

test("name", async () => {
  const response = await request(app).post("/users/sign-in");
  expect(response.statusCode).toBe(200);
})

afterAll(async () => {
  await connection.close();
});

