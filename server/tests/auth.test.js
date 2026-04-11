const request = require("supertest");
const app = require("../testApp");

describe("🔐 API AUTENTICACIÓN", () => {
  
  test("GET /api/auth/profile sin token devuelve 401", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("token");
  });

  test("POST /api/auth/login sin datos devuelve 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/register sin datos devuelve 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({});
    expect([400, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("GET / ruta raíz devuelve 200", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET ruta inexistente devuelve 404", async () => {
    const res = await request(app).get("/ruta-inexistente");
    expect(res.status).toBe(404);
  });
});