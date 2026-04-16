// src/data/products.js

module.exports = [    {
        id: 1,
        name: 'Laptop Pro 15"',
        price: 1200,
        category: 'Computadoras',
        images: [
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1588872657840-6f006fde6562?w=500&h=500&fit=crop'
        ],
        vendor: 'TechStore',
        rating: 4.8,
        shortDescription: 'Laptop potente para trabajo y gaming',
        fullDescription: 'Laptop Pro es la solución perfecta para profesionales y gamers. Equipada con procesador Intel i7-13700K de última generación, 16GB de RAM DDR5 y SSD NVMe de 512GB. Pantalla de 15.6" Full HD con tasa de refresco de 144Hz, GPU RTX 4060. Batería de larga duración hasta 10 horas, peso ligero de 2.1kg. Diseño premium en aluminio con retroiluminación de teclado.',
        specs: ['Intel i7-13700K', '16GB RAM DDR5', '512GB SSD NVMe', 'RTX 4060', 'Pantalla 144Hz']
    },
    {
        id: 2,
        name: 'Laptop Gaming ASUS',
        price: 1500,
        category: 'Computadoras',
        images: [
            'https://images.unsplash.com/photo-1588872657840-6f006fde6562?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop'
        ],
        vendor: 'GamerGear',
        rating: 4.9,
        shortDescription: 'Laptop gaming de alta performance',
        fullDescription: 'ASUS Gaming Laptop es el sueño de todo gamer. Procesador Intel i9-13900HX, GPU NVIDIA RTX 4080, 32GB RAM, 1TB SSD NVMe. Pantalla 17.3" 4K OLED con 120Hz y 1ms de respuesta. Sistema de refrigeración avanzado con 2 ventiladores. Peso 2.5kg, diseño ROG icónico. Puerto Thunderbolt 4, WiFi 6E.',
        specs: ['Intel i9-13900HX', 'RTX 4080', '32GB RAM', '1TB SSD', 'Pantalla 4K OLED 120Hz']
    },
    {
        id: 3,
        name: 'Laptop Ultrabook',
        price: 800,
        category: 'Computadoras',
        images: [
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1588872657840-6f006fde6562?w=500&h=500&fit=crop'
        ],
        vendor: 'TechElite',
        rating: 4.7,
        shortDescription: 'Laptop delgada y ligera para viajes',
        fullDescription: 'Ultrabook ultra delgada de solo 1.1cm de grosor y 1.2kg de peso. Procesador Intel i5-1340P, 8GB RAM LPDDR5, 256GB SSD. Pantalla 13.4" 16:10 con resolución 2560x1600. Batería de 15 horas, carga rápida USB-C de 65W. Perfecta para profesionales en movimiento. Marco de aluminio premium, trackpad de vidrio.',
        specs: ['Intel i5-1340P', '8GB RAM LPDDR5', '256GB SSD', 'Pantalla 13.4"', 'Batería 15h']
    },
    {
        id: 4,
        name: 'Auriculares Premium Sony',
        price: 350,
        category: 'Audio',
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop'
        ],
        vendor: 'AudioMax',
        rating: 4.8,
        shortDescription: 'Audio cristalino con cancelación de ruido',
        fullDescription: 'Sony WH-1000XM5 con tecnología de cancelación de ruido N2 de última generación. Drivers de 40mm para sonido premium de 360 Reality Audio. Batería de 30 horas, conectividad Bluetooth 5.3 y multiconexión. ANC adaptativo, modo ambiente, micrófono de 4 puntos para llamadas. Diseño cómodo, estuche de viaje premium.',
        specs: ['Sistema NC adaptativo', '30 horas batería', 'Bluetooth 5.3', 'Drivers 40mm', 'Modo ambiente']
    },
    {
        id: 5,
        name: 'Auriculares Deportivos',
        price: 150,
        category: 'Audio',
        images: [
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop'
        ],
        vendor: 'SportSound',
        rating: 4.6,
        shortDescription: 'Auriculares inalámbricos para deporte',
        fullDescription: 'Auriculares TWS deportivos con certificación IPX7 resistentes al agua. Drivers de 12mm para sonido potente, batería 8 horas + 32 horas con estuche. Control táctil, micrófono con AI para llamadas claras. Bluetooth 5.3, conectividad múltiple. Gancho de oreja ajustable, peso ultraligero. Perfecto para running, gym y actividades al aire libre.',
        specs: ['IPX7 resistente agua', '8h + 32h estuche', 'Drivers 12mm', 'Control táctil', 'Peso ultraligero']
    },
    {
        id: 6,
        name: 'Monitor 4K 27"',
        price: 550,
        category: 'Pantallas',
        images: [
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1587829191301-47ec0d148788?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=500&fit=crop'
        ],
        vendor: 'DisplayPro',
        rating: 4.8,
        shortDescription: 'Monitor 4K profesional para creativos',
        fullDescription: 'Monitor 4K 27" IPS con resolución 3840x2160 para trabajo en color. Panel IPS con 99% sRGB y Delta E < 2, ideal para diseño, edición de fotos/video. 60Hz, tiempo de respuesta 4ms. Conexión DisplayPort 1.4 + HDMI 2.1 + USB-C con Power Delivery 90W. Soporte VESA, altura ajustable, cubierta antireflejos.',
        specs: ['4K 3840x2160', '99% sRGB', 'Tiempo respuesta 4ms', 'USB-C 90W', 'Altura ajustable']
    },
    {
        id: 7,
        name: 'Monitor Gaming 144Hz',
        price: 350,
        category: 'Pantallas',
        images: [
            'https://images.unsplash.com/photo-1587829191301-47ec0d148788?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=500&fit=crop'
        ],
        vendor: 'GamerDisplay',
        rating: 4.9,
        shortDescription: 'Monitor gaming ultra rápido',
        fullDescription: 'Monitor 27" 1440p 144Hz con panel VA curvo (1800R). Tiempo de respuesta 1ms MPRT, G-Sync compatible, HDR1000 local dimming. Tasa de refresco 144Hz para gaming competitivo. Puertos DisplayPort 1.4 + HDMI 2.1. Soporte totalmente ajustable, luces RGB. Ideal para esports y gaming intenso.',
        specs: ['27" 1440p 144Hz', 'Panel VA curvo', '1ms respuesta', 'G-Sync compatible', 'HDR1000']
    },
    {
        id: 8,
        name: 'Teclado Mecánico RGB',
        price: 180,
        category: 'Periféricos',
        images: [
            'https://images.unsplash.com/photo-1587829191301-47ec0d148788?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop'
        ],
        vendor: 'KeyMaster',
        rating: 4.7,
        shortDescription: 'Teclado mecánico gaming con RGB',
        fullDescription: 'Teclado mecánico gaming premium con switches Mechanical Hot-Swappable. Retroiluminación RGB personalizable por tecla, 8 perfiles preconfigurados. Carcasa de aluminio, soporte metálico ajustable. Conectividad dual Bluetooth + USB 2.4GHz. Batería 40 horas, rápida respuesta, resistencia 50M pulsaciones. Software de configuración avanzado.',
        specs: ['Switches Hot-Swappable', 'RGB por tecla', 'Dual Bluetooth/USB', '40h batería', 'Carcasa aluminio']
    },
    {
        id: 9,
        name: 'Mouse Gaming Pro',
        price: 120,
        category: 'Periféricos',
        images: [
            'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop&q=80&h=500',
            'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop&q=70'
        ],
        vendor: 'GamerGear',
        rating: 4.8,
        shortDescription: 'Mouse ergonómico de precisión',
        fullDescription: 'Mouse gaming profesional con sensor óptico PMW3389 de 16000 DPI. 8 botones programables con software personalizable. Diseño ergonómico para diestros, peso ajustable (removible). Retroiluminación RGB, conectividad inalámbrica 2.4GHz + Bluetooth. Batería 60 horas, carcasa resistente. Compatible con todos los juegos competitivos.',
        specs: ['Sensor 16000 DPI', '8 botones programables', '60h batería', 'Peso ajustable', 'RGB']
    },
    {
        id: 10,
        name: 'Webcam 4K Pro',
        price: 180,
        category: 'Periféricos',
        images: [
            'https://images.unsplash.com/photo-1586253408515-b2c01b9d0aa0?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
        ],
        vendor: 'StreamPro',
        rating: 4.6,
        shortDescription: 'Webcam 4K para streaming y videollamadas',
        fullDescription: 'Webcam 4K Ultra HD con sensor Sony de 8MP. Grabación 4K a 30fps o 1080p a 60fps. Corrección automática de luz, enfoque automático, ángulo de visión 90°. Micrófono estéreo de cancelación de ruido. Soporte universal, conexión USB 2.0. Compatible con Windows, Mac, Linux y todas las plataformas de streaming.',
        specs: ['4K 30fps / 1080p 60fps', 'Sensor Sony 8MP', 'Ángulo 90°', 'Micrófono estéreo', 'USB 2.0']
    },
    {
        id: 11,
        name: 'Tablets HD 10"',
        price: 299,
        category: 'Tablets',
        images: [
            'https://images.unsplash.com/photo-1561154464-82b745bb9df8?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop'
        ],
        vendor: 'TabletPro',
        rating: 4.7,
        shortDescription: 'Tablet grande para multimedia',
        fullDescription: 'Tablet 10.1" con procesador Octa-core 2.0GHz. Pantalla IPS 1920x1200, 128GB almacenamiento, 4GB RAM. Batería 7000mAh, carga rápida 18W. Cámaras 13MP trasera + 8MP frontal. Altavoces estéreo dual con sonido Dolby Atmos. Sistema operativo Android 13, compatible con teclado y stylus.',
        specs: ['Pantalla 10.1" IPS', '128GB almacenamiento', '4GB RAM', 'Batería 7000mAh', 'Cámaras 13MP+8MP']
    },
    {
        id: 12,
        name: 'Smartwatch Premium',
        price: 399,
        category: 'Wearables',
        images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&q=80',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&q=70'
        ],
        vendor: 'WatchPro',
        rating: 4.9,
        shortDescription: 'Reloj inteligente con salud avanzada',
        fullDescription: 'Smartwatch Premium con pantalla AMOLED 1.4" siempre encendida. Monitoreo completo de salud: frecuencia cardíaca, saturación O2, estrés, sueño. GPS integrado, resistencia al agua 5ATM. Batería 14 días, carga rápida. 100+ modos de ejercicio, NFC para pagos. Compatibilidad Android e iOS. Diseño premium con correa personalizable.',
        specs: ['AMOLED 1.4"', 'GPS + GLONASS', '5ATM resistencia', '14 días batería', '100+ modos ejercicio']
    },
    {
        id: 13,
        name: 'Cámara Digital DSLR',
        price: 950,
        category: 'Cámaras',
        images: [
            'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop'
        ],
        vendor: 'CameraHub',
        rating: 4.8,
        shortDescription: 'Cámara profesional para fotografía',
        fullDescription: 'Cámara DSLR profesional con sensor de fotograma completo 24.2MP. Grabación 4K a 60fps, 1080p a 240fps para slow-motion. Sistema de enfoque automático con 425 puntos. Pantalla táctil abatible 3.2" para ángulos creativos. Conexión WiFi 6E, Bluetooth 5.2. Incluye lentes 18-55mm + 70-300mm, batería de dos horas.',
        specs: ['Sensor 24.2MP FF', '4K 60fps', '425 puntos AF', 'WiFi 6E', '2 baterías']
    },
    {
        id: 14,
        name: 'Micrófono Profesional',
        price: 280,
        category: 'Audio',
        images: [
            'https://images.unsplash.com/photo-1611339555312-e607c04352fa?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop'
        ],
        vendor: 'AudioPro',
        rating: 4.9,
        shortDescription: 'Micrófono condensador cardiode',
        fullDescription: 'Micrófono condensador cardiode profesional con patrón polar personalizado. Respuesta de frecuencia 20Hz-20kHz, sensibilidad máxima. Salida XLR balanceada, compatible con interface de audio estándar. Incluye brazo de soporte articulado, filtro pop, soporte de shock. Aislamiento acústico interno. Ideal para podcasts, streaming, música.',
        specs: ['Patrón cardiode', '20Hz-20kHz', 'Salida XLR', 'Aislamiento interno', 'Brazo articul.']
    },
    {
        id: 15,
        name: 'Mochila Gaming 50L',
        price: 89,
        category: 'Accesorios',
        images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&q=80',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&q=70'
        ],
        vendor: 'BackpackPro',
        rating: 4.7,
        shortDescription: 'Mochila grande con compartimentos',
        fullDescription: 'Mochila gaming 50L con múltiples compartimentos especializados. Compartimento acolchado para laptop de hasta 17", tablet, accesorios. Material resistente al agua 1680D Ballistic Nylon. Soporte lumbar ergonómico, correas ajustables. Puerto USB externo + cable de carga interno. Numerosos bolsillos organizadores. Garantía de por vida.',
        specs: ['Capacidad 50L', 'Acolchado laptop 17"', 'Resistencia agua', 'Puerto USB', 'Garantía vitalicia']
    },
    {
        id: 16,
        name: 'Hub USB-C Multipuerto',
        price: 79,
        category: 'Accesorios',
        images: [
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop&q=80',
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop&q=70'
        ],
        vendor: 'TechAccess',
        rating: 4.6,
        shortDescription: 'Expansor de puertos USB-C',
        fullDescription: 'Hub USB-C 7-en-1 profesional de aluminio. Incluye 3x USB 3.0, 1x HDMI 4K 60Hz, 1x DisplayPort, 1x USB-C con Power Delivery 100W, 1x jack 3.5mm audio. Carcasa de aluminio anodizado, LED indicador. Compatible con Windows, Mac, Linux. Teoría conductora 2K, transmisión rápida datos.',
        specs: ['7 puertos', 'HDMI 4K 60Hz', 'PD 100W', 'Aluminio anod.', 'LED indicador']
    },
];
