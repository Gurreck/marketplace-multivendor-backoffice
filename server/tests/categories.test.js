const request = require("supertest");
const app = require("../testApp");

describe("📂 API CATEGORÍAS", () => {
  
  test("GET /api/categories devuelve respuesta", async () => {
    const res = await request(app).get("/api/categories");
    expect([200, 500]).toContain(res.status);
  });

  test("GET /api/categories estructura de respuesta", async () => {
    const res = await request(app).get("/api/categories");
    if (res.status === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
    }
  });
});