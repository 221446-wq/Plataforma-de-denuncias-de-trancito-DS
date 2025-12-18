const express = require('express');
const router = express.Router();
const DenunciaController = require('../Controllers/denunciaController');
const { authMiddleware } = require('../Middleware/auth');
const upload = require('../Middleware/upload'); // Importar Multer

// Aplicar middleware de autenticación a TODAS las rutas de denuncias
router.use(authMiddleware);

// Ruta para crear denuncia (con subida de imagen)
router.post('/', upload.array('fotos', 5), DenunciaController.crearDenuncia);

// Ruta para buscar denuncia por código (específica)
router.get('/codigo/:codigo', DenunciaController.buscarDenuncia);

// Ruta para obtener denuncia por ID (numérico)
router.get('/id/:id', DenunciaController.obtenerDenunciaPorId);

// Ruta para listar denuncias (con filtros opcionales)
router.get('/', DenunciaController.listarDenuncias);

// Ruta para actualizar estado de denuncia
router.put('/:id/estado', DenunciaController.actualizarEstado);

module.exports = router;