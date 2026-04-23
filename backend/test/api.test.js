import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
import User from "../src/models/User.js";
import Todo from "../src/models/Todo.js";

describe("API integration", function () {
  this.timeout(300000);
  const app = createApp();

  before(async function () {
    const uri = process.env.MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/mern_todos_test";
    await mongoose.connect(uri);
  });

  after(async function () {
    await mongoose.connection.close();
  });

  beforeEach(async function () {
    await Promise.all([User.deleteMany({}), Todo.deleteMany({})]);
  });

  it("registers and logs in a user", async function () {
    const registerRes = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "secret123",
    });

    expect(registerRes.status).to.equal(201);
    expect(registerRes.body).to.have.property("token");
    expect(registerRes.body).to.have.nested.property("user.email", "test@example.com");

    const loginRes = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "secret123",
    });

    expect(loginRes.status).to.equal(200);
    expect(loginRes.body).to.have.property("token");
  });

  it("performs authenticated todo CRUD flow", async function () {
    const registerRes = await request(app).post("/auth/register").send({
      name: "Todo User",
      email: "todo@example.com",
      password: "secret123",
    });
    const token = registerRes.body.token;
    const auth = { Authorization: `Bearer ${token}` };

    const createRes = await request(app).post("/todos").set(auth).send({ title: "Write tests" });
    expect(createRes.status).to.equal(201);
    expect(createRes.body).to.have.property("title", "Write tests");

    const todoId = createRes.body._id;

    const listRes = await request(app).get("/todos").set(auth);
    expect(listRes.status).to.equal(200);
    expect(listRes.body).to.have.length(1);

    const updateRes = await request(app)
      .put(`/todos/${todoId}`)
      .set(auth)
      .send({ completed: true, title: "Write integration tests" });
    expect(updateRes.status).to.equal(200);
    expect(updateRes.body).to.have.property("completed", true);
    expect(updateRes.body).to.have.property("title", "Write integration tests");

    const deleteRes = await request(app).delete(`/todos/${todoId}`).set(auth);
    expect(deleteRes.status).to.equal(200);

    const finalList = await request(app).get("/todos").set(auth);
    expect(finalList.status).to.equal(200);
    expect(finalList.body).to.have.length(0);
  });
});
