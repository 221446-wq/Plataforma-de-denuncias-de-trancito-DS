const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middleware/auth');

// Importar el controlador
const EstadisticaController = require('../Controllers/estadisticaController');

console.log('🔍 Verificando controlador de estadísticas:');
console.log('EstadisticaController:', EstadisticaController);
console.log('getEstadisticasGenerales:', typeof EstadisticaController?.getEstadisticasGenerales);

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Ruta de prueba
router.get('/test', (req, res) => {
    console.log('✅ Ruta de estadísticas funcionando');
    res.json({ 
        message: 'Estadísticas API funcionando',
        timestamp: new Date().toISOString()
    });
});

// Ruta de estadísticas generales
router.get('/generales', (req, res) => {
    console.log('📊 Llamando a getEstadisticasGenerales');
    
    // Verificar que el método exista
    if (typeof EstadisticaController.getEstadisticasGenerales === 'function') {
        return EstadisticaController.getEstadisticasGenerales(req, res);
    } else {
        console.error('❌ getEstadisticasGenerales no es una función');
        return res.status(500).json({ 
            error: 'Error interno: Controlador no disponible' 
        });
    }
});

// Ruta por tipo
router.get('/por-tipo', (req, res) => {
    if (typeof EstadisticaController.getPorTipo === 'function') {
        return EstadisticaController.getPorTipo(req, res);
    } else {
        return res.status(500).json({ error: 'Error interno: Controlador no disponible' });
    }
});

// Ruta evolución mensual
router.get('/evolucion-mensual/:anio', (req, res) => {
    if (typeof EstadisticaController.getEvolucionMensual === 'function') {
        return EstadisticaController.getEvolucionMensual(req, res);
    } else {
        return res.status(500).json({ error: 'Error interno: Controlador no disponible' });
    }
});

// Ruta por prioridad
router.get('/por-prioridad', (req, res) => {
    if (typeof EstadisticaController.getPorPrioridad === 'function') {
        return EstadisticaController.getPorPrioridad(req, res);
    } else {
        return res.status(500).json({ error: 'Error interno: Controlador no disponible' });
    }
});

// Ruta filtros
router.get('/filtros', (req, res) => {
    if (typeof EstadisticaController.getDatosFiltros === 'function') {
        return EstadisticaController.getDatosFiltros(req, res);
    } else {
        return res.status(500).json({ error: 'Error interno: Controlador no disponible' });
    }
});

module.exports = router;