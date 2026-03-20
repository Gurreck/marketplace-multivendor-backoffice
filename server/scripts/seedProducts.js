require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const products = require("../Data/products");


const VENDOR_ID = "69b36413d23968137a83fa28";

async function seedProducts() {
  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo conectado");

    for (const product of products) {

      let uploadedImages = [];

      for (const img of product.images) {

        const result = await cloudinary.uploader.upload(img, {
          folder: `marketplace/vendors/${VENDOR_ID}`
        });

        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id
        });

      }

      await Product.create({
        name: product.name,
        description: product.fullDescription,
        price: product.price,
        category: product.category,
        brand: product.vendor,
        stock: 10,
        images: uploadedImages,
        vendor: VENDOR_ID
      });

      console.log("Producto creado:", product.name);
    }

    console.log("Todos los productos cargados 🚀");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedProducts();