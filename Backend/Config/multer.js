// Config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Aseguramos que la carpeta "uploads" exista
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// 2. Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Carpeta donde se guardan
    },
    filename: function (req, file, cb) {
        // Le ponemos fecha + nombre original para que no se repitan
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. Filtros (Opcional: para validar que sean imágenes o videos)
const fileFilter = (req, file, cb) => {
    // Aceptamos todo por ahora para que no te de errores
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;