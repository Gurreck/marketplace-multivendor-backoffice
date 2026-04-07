const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const maskedURI = process.env.MONGODB_URI.replace(/\/\/.*@/, "//***:***@");
    console.log(`📡 Conectando a: ${maskedURI}`);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1); // mejor detener el servidor si no conecta
  }
};

module.exports = connectDB;