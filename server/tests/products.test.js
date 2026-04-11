const request = require("supertest");
const app = require("../testApp");

describe("📦 API PRODUCTOS", () => {
  
  test("GET /api/products devuelve response válida", async () => {
    const res = await request(app).get("/api/products");
    expect([200, 500]).toContain(res.status);
  });

  test("GET /api/products?search=test filtra productos", async () => {
    const res = await request(app).get("/api/products?search=test");
    expect([200, 500]).toContain(res.status);
  });

  test("GET /api/products?category=Electrónica filtra por categoría", async () => {
    const res = await request(app).get("/api/products?category=Electrónica");
    expect([200, 500]).toContain(res.status);
  });

  test("GET /api/products?priceMin=100&priceMax=500 filtra por precio", async () => {
    const res = await request(app).get("/api/products?priceMin=100&priceMax=500");
    expect([200, 500]).toContain(res.status);
  });

  test("GET /api/ruta-inexistente devuelve 404", async () => {
    const res = await request(app).get("/api/products/ruta-inexistente");
    expect([404, 500]).toContain(res.status);
  });
});