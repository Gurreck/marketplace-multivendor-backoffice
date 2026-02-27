require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");

const initialProducts = [
    {
        name: 'Laptop Pro 15"',
        price: 1200,
        category: 'Computadoras',
        images: [
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1588872657840-6f006fde6562?w=500&h=500&fit=crop'
        ],
        brand: 'TechStore',
        stock: 10,
        description: 'Laptop Pro es la solución perfecta para profesionales y gamers. Equipada con procesador Intel i7-13700K de última generación, 16GB de RAM DDR5 y SSD NVMe de 512GB.'
    },
    {
        name: 'Laptop Gaming ASUS',
        price: 1500,
        category: 'Computadoras',
        images: [
            'https://images.unsplash.com/photo-1588872657840-6f006fde6562?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop'
        ],
        brand: 'GamerGear',
        stock: 5,
        description: 'ASUS Gaming Laptop es el sueño de todo gamer. Procesador Intel i9-13900HX, GPU NVIDIA RTX 4080, 32GB RAM, 1TB SSD NVMe.'
    },
    {
        name: 'Laptop Ultrabook',
        price: 800,
        category: 'Computadoras',
        images: [
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1588872657840-6f006fde6562?w=500&h=500&fit=crop'
        ],
        brand: 'TechElite',
        stock: 15,
        description: 'Ultrabook ultra delgada de solo 1.1cm de grosor y 1.2kg de peso. Procesador Intel i5-1340P, 8GB RAM LPDDR5, 256GB SSD.'
    },
    {
        name: 'Auriculares Premium Sony',
        price: 350,
        category: 'Audio',
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop'
        ],
        brand: 'AudioMax',
        stock: 20,
        description: 'Sony WH-1000XM5 con tecnología de cancelación de ruido N2 de última generación. Drivers de 40mm para sonido premium.'
    },
    {
        name: 'Auriculares Deportivos',
        price: 150,
        category: 'Audio',
        images: [
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop'
        ],
        brand: 'SportSound',
        stock: 30,
        description: 'Auriculares TWS deportivos con certificación IPX7 resistentes al agua. Drivers de 12mm para sonido potente.'
    },
    {
        name: 'Monitor 4K 27"',
        price: 550,
        category: 'Pantallas',
        images: [
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1587829191301-47ec0d148788?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=500&fit=crop'
        ],
        brand: 'DisplayPro',
        stock: 8,
        description: 'Monitor 4K 27" IPS con resolución 3840x2160 para trabajo en color. Panel IPS con 99% sRGB.'
    },
    {
        name: 'Monitor Gaming 144Hz',
        price: 350,
        category: 'Pantallas',
        images: [
            'https://images.unsplash.com/photo-1587829191301-47ec0d148788?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=500&fit=crop'
        ],
        brand: 'GamerDisplay',
        stock: 12,
        description: 'Monitor 27" 1440p 144Hz con panel VA curvo (1800R). Tiempo de respuesta 1ms MPRT, G-Sync compatible.'
    },
    {
        name: 'Teclado Mecánico RGB',
        price: 180,
        category: 'Periféricos',
        images: [
            'https://images.unsplash.com/photo-1587829191301-47ec0d148788?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop'
        ],
        brand: 'KeyMaster',
        stock: 25,
        description: 'Teclado mecánico gaming premium con switches Mechanical Hot-Swappable. Retroiluminación RGB personalizable.'
    },
    {
        name: 'Mouse Gaming Pro',
        price: 120,
        category: 'Periféricos',
        images: [
            'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop&q=80&h=500',
            'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop&q=70'
        ],
        brand: 'GamerGear',
        stock: 40,
        description: 'Mouse gaming profesional con sensor óptico PMW3389 de 16000 DPI. 8 botones programables.'
    },
    {
        name: 'Webcam 4K Pro',
        price: 180,
        category: 'Periféricos',
        images: [
            'https://images.unsplash.com/photo-1586253408515-b2c01b9d0aa0?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
        ],
        brand: 'StreamPro',
        stock: 15,
        description: 'Webcam 4K Ultra HD con sensor Sony de 8MP. Grabación 4K a 30fps o 1080p a 60fps.'
    },
    {
        name: 'Tablets HD 10"',
        price: 299,
        category: 'Tablets',
        images: [
            'https://images.unsplash.com/photo-1561154464-82b745bb9df8?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop'
        ],
        brand: 'TabletPro',
        stock: 20,
        description: 'Tablet 10.1" con procesador Octa-core 2.0GHz. Pantalla IPS 1920x1200, 128GB almacenamiento.'
    },
    {
        name: 'Smartwatch Premium',
        price: 399,
        category: 'Wearables',
        images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&q=80',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&q=70'
        ],
        brand: 'WatchPro',
        stock: 25,
        description: 'Smartwatch Premium con pantalla AMOLED 1.4" siempre encendida. Monitoreo completo de salud.'
    },
    {
        name: 'Cámara Digital DSLR',
        price: 950,
        category: 'Cámaras',
        images: [
            'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop'
        ],
        brand: 'CameraHub',
        stock: 10,
        description: 'Cámara DSLR profesional con sensor de fotograma completo 24.2MP. Grabación 4K a 60fps.'
    },
    {
        name: 'Micrófono Profesional',
        price: 280,
        category: 'Audio',
        images: [
            'https://images.unsplash.com/photo-1611339555312-e607c04352fa?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop'
        ],
        brand: 'AudioPro',
        stock: 15,
        description: 'Micrófono condensador cardiode profesional con patrón polar personalizado. Respuesta de frecuencia 20Hz-20kHz.'
    },
    {
        name: 'Mochila Gaming 50L',
        price: 89,
        category: 'Accesorios',
        images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&q=80',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&q=70'
        ],
        brand: 'BackpackPro',
        stock: 50,
        description: 'Mochila gaming 50L con múltiples compartimentos especializados. Material resistente al agua.'
    },
    {
        name: 'Hub USB-C Multipuerto',
        price: 79,
        category: 'Accesorios',
        images: [
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop&q=80',
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop&q=70'
        ],
        brand: 'TechAccess',
        stock: 60,
        description: 'Hub USB-C 7-en-1 profesional de aluminio. Incluye 3x USB 3.0, 1x HDMI 4K 60Hz.'
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB conectado para seed de productos...");

        // Obtener el usuario administrador para asignar los productos
        const admin = await User.findOne({ role: "administrador" });
        if (!admin) {
            console.error("No se encontró un usuario administrador. Por favor, corre 'npm run seed' primero.");
            process.exit(1);
        }

        // Limpiar productos existentes opcionalmente? 
        // No, mejor solo agregar los que no están para no borrar el del usuario.

        for (const prodData of initialProducts) {
            const exists = await Product.findOne({ name: prodData.name });
            if (!exists) {
                await Product.create({
                    ...prodData,
                    vendor: admin._id
                });
                console.log(`Producto creado: ${prodData.name}`);
            } else {
                console.log(`Producto ya existe: ${prodData.name}`);
            }
        }

        console.log("Seed de productos completado satisfactoriamente.");
        process.exit(0);
    } catch (error) {
        console.error("Error al seedear productos:", error.message);
        process.exit(1);
    }
};

seedProducts();
