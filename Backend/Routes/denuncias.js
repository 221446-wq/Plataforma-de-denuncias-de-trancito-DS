const express = require('express');
const router = express.Router();
const DenunciaController = require('../Controllers/denunciaController');
const { authMiddleware } = require('../Middleware/auth');
const upload = require('../Config/multer'); // <--- 1. IMPORTANTE: Importamos Multer

// Aplicar middleware de autenticación a TODAS las rutas
router.use(authMiddleware);

// Ruta para crear denuncia (MODIFICADA PARA ACEPTAR ARCHIVOS)
// upload.fields dice: "Espera archivos en estos campos específicos"
router.post('/', 
    upload.fields([ // <--- 2. AGREGAMOS ESTE MIDDLEWARE
        { name: 'fotos', maxCount: 5 },       // Puede subir hasta 5 fotos
        { name: 'videos', maxCount: 2 },      // Puede subir hasta 2 videos
        { name: 'documentos', maxCount: 3 }   // Puede subir hasta 3 documentos
    ]),
    DenunciaController.crearDenuncia
);

// Las demás rutas quedan igual
router.get('/codigo/:codigo', DenunciaController.buscarDenuncia);
router.get('/id/:id', DenunciaController.obtenerDenunciaPorId);
router.get('/', DenunciaController.listarDenuncias);
router.put('/:id/estado', DenunciaController.actualizarEstado);

module.exports = router;