const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const products = require("../Data/products");

const VENDOR_ID = "698e538302d958a16fd81a41";

async function uploadFromUrl(imageUrl, folder) {
  // Descarga la imagen como buffer
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`No se pudo descargar: ${imageUrl}`);
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Sube el buffer a Cloudinary
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongo conectado");

    for (const product of products) {
      let uploadedImages = [];

      for (const img of product.images) {
        try {
          const result = await uploadFromUrl(
            img,
            `marketplace/vendors/${VENDOR_ID}`
          );
          uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
          console.log("  Imagen subida:", result.secure_url);
        } catch (imgError) {
          console.warn("  ⚠️ Imagen saltada:", img, imgError.message);
          // Continúa con las demás imágenes en lugar de romper todo
        }
      }

      if (uploadedImages.length === 0) {
        console.warn("⚠️ Producto sin imágenes, saltando:", product.name);
        continue;
      }

      await Product.create({
        name: product.name,
        description: product.fullDescription,
        price: product.price,
        category: product.category,
        brand: product.vendor,
        stock: 10,
        images: uploadedImages,
        vendor: VENDOR_ID,
      });

      console.log("✅ Producto creado:", product.name);
    }

    console.log("🚀 Todos los productos cargados");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedProducts();