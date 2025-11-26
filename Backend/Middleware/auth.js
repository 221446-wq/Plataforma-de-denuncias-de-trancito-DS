const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Middleware de autenticación básica
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        console.log('=== MIDDLEWARE AUTH ===');
        console.log('Token recibido:', token ? 'Presente' : 'Ausente');
        
        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        console.log('Token decodificado:', decoded);
        
        const user = await User.findById(decoded.id);
        console.log('Usuario encontrado:', user ? user.usuario : 'No encontrado');

        if (!user) {
            return res.status(401).json({ error: 'Token inválido. Usuario no encontrado.' });
        }


        req.user = user;
        console.log('Autenticación exitosa para:', user.usuario);
        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido.' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado.' });
        }
        
        res.status(401).json({ error: 'Error de autenticación.' });
    }
};

// Middleware específico para administradores
const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        console.log('=== ADMIN MIDDLEWARE ===');
        console.log('Token recibido:', token ? 'Presente' : 'Ausente');
        
        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        console.log('Token decodificado:', decoded);
        
        const user = await User.findById(decoded.id);
        console.log('Usuario encontrado:', user ? user.usuario : 'No encontrado');

        if (!user) {
            return res.status(401).json({ error: 'Token inválido. Usuario no encontrado.' });
        }

        

        // Verificar que sea administrador
        console.log('Tipo de usuario:', user.tipo_usuario);
        if (user.tipo_usuario !== 'administrador') {
            return res.status(403).json({ 
                error: 'Acceso denegado. Se requieren permisos de administrador.' 
            });
        }

        req.user = user;
        console.log('Acceso de administrador concedido para:', user.usuario);
        next();
    } catch (error) {
        console.error('Error en autenticación de administrador:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido.' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado.' });
        }
        
        res.status(401).json({ error: 'Error de autenticación.' });
    }
};

// Exportar ambos middlewares
module.exports = { 
    authMiddleware, 
    adminMiddleware 
};
