require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rutas
const authRoutes = require('./Routes/auth');
const denunciaRoutes = require('./Routes/denuncias');
const estadisticaRoutes = require('./Routes/estadisticas');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/denuncias', denunciaRoutes);
app.use('/api/estadisticas', estadisticaRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API de Plataforma de Denuncias funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a la Plataforma de Denuncias Virtuales - Municipalidad del Cusco',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            denuncias: '/api/denuncias',
            estadisticas: '/api/estadisticas'
        }
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 API disponible en: http://localhost:${PORT}`);
    console.log(`🔗 Documentación: http://localhost:${PORT}/`);
});