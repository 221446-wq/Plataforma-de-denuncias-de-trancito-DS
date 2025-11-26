const express = require('express');
const router = express.Router();

// Importar controlador y middlewares
const authController = require('../Controllers/authController');
const { adminMiddleware } = require('../Middleware/auth');

// Verificar que los métodos existan (para debugging)
console.log('=== VERIFICANDO MÉTODOS AUTH CONTROLLER ===');
console.log('login:', typeof authController.login);
console.log('register:', typeof authController.register);
console.log('registerFuncionario:', typeof authController.registerFuncionario);

console.log('=== VERIFICANDO MIDDLEWARES ===');
const authMiddlewares = require('../Middleware/auth');
console.log('adminMiddleware:', typeof authMiddlewares.adminMiddleware);

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Ruta protegida para administradores - REGISTRO DE FUNCIONARIOS
router.post('/register-funcionario', adminMiddleware, authController.registerFuncionario);

// Ruta para verificar token (solo administradores)
router.get('/verify', adminMiddleware, (req, res) => {
    res.json({ 
        message: 'Token válido', 
        user: {
            id: req.user.id,
            nombres: req.user.nombres,
            apellidos: req.user.apellidos,
            usuario: req.user.usuario,
            tipo_usuario: req.user.tipo_usuario,
            cargo: req.user.cargo
        }
    });
});

module.exports = router;
