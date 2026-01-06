const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento de Multer
const storage = multer.memoryStorage();

// Filtro de archivos para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: El archivo debe ser una imagen válida (jpeg, jpg, png, gif)'));
};

// Crear la instancia de Multer con la configuración
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
    fileFilter: fileFilter
});

module.exports = upload;
