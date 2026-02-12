const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log(
      "Intentando conectar con URI:",
      process.env.MONGODB_URI.substring(0, 20) + "...",
    );
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4, // Force IPv4
      tlsInsecure: true, // DEBUG: Ignore SSL errors
    });
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
