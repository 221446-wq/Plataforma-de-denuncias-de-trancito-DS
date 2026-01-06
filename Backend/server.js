require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// =====================
// Middlewares
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Servir archivos estáticos
// =====================
// Frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Archivos subidos (si usas uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// Importar rutas API
// =====================
const authRoutes = require('./Routes/auth');
const denunciaRoutes = require('./Routes/denuncias');
const estadisticaRoutes = require('./Routes/estadisticas');

// =====================
// Usar rutas API
// =====================
app.use('/api/auth', authRoutes);
app.use('/api/denuncias', denunciaRoutes);
app.use('/api/estadisticas', estadisticaRoutes);
// Después de app.use('/api/auth', authRoutes);
const dniRoutes = require('./Routes/dni');
app.use('/api/dni', dniRoutes);

// =====================
// Ruta de prueba API
// =====================
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API de Plataforma de Denuncias funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// =====================
// Ruta principal (WEB)
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

// =====================
// Manejo de rutas no encontradas
// =====================
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// =====================
// Manejo de errores
// =====================
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Contacte al administrador'
    });
});

// =====================
// Puerto (obligatorio para Render)
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
