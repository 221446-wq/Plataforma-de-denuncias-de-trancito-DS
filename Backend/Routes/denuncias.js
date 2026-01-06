const express = require('express');
const router = express.Router();
const DenunciaController = require('../Controllers/denunciaController');
// Importar ambos middlewares
const { authMiddleware, authOptional } = require('../Middleware/auth'); 
const upload = require('../Middleware/upload'); // Importar Multer

// Ruta para crear denuncia (con autenticación opcional)
router.post('/', authOptional, upload.array('fotos', 5), DenunciaController.crearDenuncia);

// Ruta para buscar denuncia por código (pública, sin autenticación)
router.get('/codigo/:codigo', DenunciaController.buscarDenuncia);

// Rutas protegidas que requieren autenticación
router.get('/id/:id', authMiddleware, DenunciaController.obtenerDenunciaPorId);
router.get('/', authMiddleware, DenunciaController.listarDenuncias);
router.put('/:id/estado', authMiddleware, DenunciaController.actualizarEstado);

// Ruta para consulta de DNI
router.get('/dni/:dni', DenunciaController.consultarDNI);

module.exports = router;