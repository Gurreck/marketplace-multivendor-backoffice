require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Cart = require("./models/Cart");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB Atlas para inicialización...");

    // 1. Limpiar datos existentes (Opcional, pero recomendado para un seed limpio)
    // Descomenta si deseas borrar todo antes de empezar:
    // await User.deleteMany({});
    // await Product.deleteMany({});
    // await Order.deleteMany({});
    // await Cart.deleteMany({});

    // 2. Crear Usuarios de prueba si no existen
    console.log("Creando usuarios...");

    let admin = await User.findOne({ email: "admin@marketplace.com" });
    if (!admin) {
      admin = await User.create({
        nombre: "Administrador Global",
        email: "admin@marketplace.com",
        password: "admin123",
        role: "administrador",
      });
    }

    let vendor = await User.findOne({ email: "vendor@test.com" });
    if (!vendor) {
      vendor = await User.create({
        nombre: "Tienda de Teconología",
        email: "vendor@test.com",
        password: "password123",
        role: "vendedor",
      });
    }

    let client = await User.findOne({ email: "cliente@test.com" });
    if (!client) {
      client = await User.create({
        nombre: "Juan Pérez",
        email: "cliente@test.com",
        password: "password123",
        role: "cliente",
      });
    }

    // 3. Crear Productos para el vendedor
    console.log("Creando productos...");
    const productsData = [
      {
        name: "Smartphone Pro 15",
        description:
          "El mejor smartphone con cámara de 108MP y batería de larga duración.",
        price: 899.99,
        category: "Electrónica",
        brand: "TechBrand",
        stock: 50,
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
        ],
        vendor: vendor._id,
      },
      {
        name: "Laptop UltraBook G2",
        description:
          "Potente, ligera y elegante. Ideal para diseñadores y gamers.",
        price: 1299.0,
        category: "Computación",
        brand: "GamerPro",
        stock: 20,
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
        ],
        vendor: vendor._id,
      },
      {
        name: "Audífonos Noise Cancelling",
        description: "Sumérgete en tu música sin ruidos externos.",
        price: 249.5,
        category: "Audio",
        brand: "SoundWave",
        stock: 100,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        ],
        vendor: vendor._id,
      },
    ];

    // Solo creamos si la base está vacía de productos
    let products = await Product.find({ vendor: vendor._id });
    if (products.length === 0) {
      products = await Product.insertMany(productsData);
    }

    // 4. Crear un pedido de ejemplo para el cliente
    console.log("Creando pedido de ejemplo...");
    const existingOrder = await Order.findOne({ user: client._id });
    if (!existingOrder) {
      const orderData = {
        user: client._id,
        orderItems: [
          {
            name: products[0].name,
            quantity: 1,
            image: products[0].images[0],
            price: products[0].price,
            product: products[0]._id,
            vendor: vendor._id,
          },
        ],
        shippingAddress: {
          address: "Calle Falsa 123",
          city: "Ciudad de México",
          country: "México",
        },
        paymentMethod: "PayPal",
        itemsPrice: products[0].price,
        taxPrice: products[0].price * 0.16,
        shippingPrice: 15.0,
        totalPrice: products[0].price + products[0].price * 0.16 + 15.0,
        isPaid: true,
        paidAt: new Date(),
      };
      await Order.create(orderData);
    }

    // 5. Crear Carrito con items para el cliente
    console.log("Inicializando carrito...");
    const existingCart = await Cart.findOne({ user: client._id });
    if (!existingCart) {
      await Cart.create({
        user: client._id,
        items: [
          { product: products[1]._id, quantity: 2 },
          { product: products[2]._id, quantity: 1 },
        ],
      });
    }

    console.log("\n✅ Base de datos inicializada exitosamente:");
    console.log("------------------------------------------");
    console.log(`Admin:    admin@marketplace.com / admin123`);
    console.log(`Vendedor: vendor@test.com / password123`);
    console.log(`Cliente:  cliente@test.com / password123`);
    console.log(`Productos creados: ${products.length}`);
    console.log("------------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error.message);
    process.exit(1);
  }
};

seedDatabase();
