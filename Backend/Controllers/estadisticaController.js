// Verificar que el modelo se pueda cargar
let Estadistica;
try {
    Estadistica = require('../Models/Estadistica');
    console.log(' Modelo Estadistica cargado correctamente');
} catch (error) {
    console.error(' Error cargando modelo Estadistica:', error);
}

class EstadisticaController {
    static async getEstadisticasGenerales(req, res) {
        try {
            console.log(' Iniciando getEstadisticasGenerales...');
            
            if (!Estadistica) {
                throw new Error('Modelo Estadistica no disponible');
            }
            
            const estadisticas = await Estadistica.getEstadisticasGenerales();
            
            const estadisticasCompletas = {
                total_denuncias: estadisticas.total_denuncias || 0,
                recibidas: estadisticas.recibidas || 0,
                en_proceso: estadisticas.en_proceso || 0,
                resueltas: estadisticas.resueltas || 0,
                archivadas: estadisticas.archivadas || 0
            };
            
            console.log(' Estadísticas generales obtenidas:', estadisticasCompletas);
            res.json(estadisticasCompletas);
            
        } catch (error) {
            console.error(' Error en getEstadisticasGenerales:', error);
            res.status(500).json({ 
                error: 'Error al obtener estadísticas generales',
                detalle: error.message 
            });
        }
    }

    static async getPorTipo(req, res) {
        try {
            console.log(' Iniciando getPorTipo...');
            
            if (!Estadistica) {
                throw new Error('Modelo Estadistica no disponible');
            }
            
            const datos = await Estadistica.getPorTipo();
            const datosSeguros = Array.isArray(datos) ? datos : [];
            
            console.log(' Datos por tipo obtenidos:', datosSeguros.length);
            res.json(datosSeguros);
            
        } catch (error) {
            console.error(' Error en getPorTipo:', error);
            res.status(500).json({ 
                error: 'Error al obtener datos por tipo',
                detalle: error.message 
            });
        }
    }

    static async getEvolucionMensual(req, res) {
        try {
            const { anio } = req.params;
            const anioUsar = anio || new Date().getFullYear();
            
            console.log(' Iniciando getEvolucionMensual para año:', anioUsar);
            
            if (!Estadistica) {
                throw new Error('Modelo Estadistica no disponible');
            }
            
            const datos = await Estadistica.getEvolucionMensual(anioUsar);
            const datosCompletos = this.completarMesesFaltantes(datos);
            
            console.log(' Evolución mensual obtenida:', datosCompletos.length);
            res.json(datosCompletos);
            
        } catch (error) {
            console.error(' Error en getEvolucionMensual:', error);
            res.status(500).json({ 
                error: 'Error al obtener evolución mensual',
                detalle: error.message 
            });
        }
    }

    static async getPorPrioridad(req, res) {
        try {
            console.log(' Iniciando getPorPrioridad...');
            
            if (!Estadistica) {
                throw new Error('Modelo Estadistica no disponible');
            }
            
            const datos = await Estadistica.getPorPrioridad();
            const datosSeguros = Array.isArray(datos) ? datos : [];
            
            console.log(' Datos por prioridad obtenidos:', datosSeguros.length);
            res.json(datosSeguros);
            
        } catch (error) {
            console.error(' Error en getPorPrioridad:', error);
            res.status(500).json({ 
                error: 'Error al obtener datos por prioridad',
                detalle: error.message 
            });
        }
    }

    static async getDatosFiltros(req, res) {
        try {
            console.log(' Iniciando getDatosFiltros...');
            
            const filtros = {
                tipos_denuncia: [
                    'Vehículo mal estacionado',
                    'Exceso de velocidad',
                    'Semáforo dañado',
                    'Accidente de tránsito',
                    'Conducción peligrosa',
                    'Falta de señalización',
                    'Transporte público irregular',
                    'Otros'
                ],
                distritos: [
                    'Cusco',
                    'San Jerónimo',
                    'San Sebastián',
                    'Santiago',
                    'Wanchaq',
                    'Todos los distritos'
                ],
                periodos: [
                    '2020-2024',
                    '2015-2019',
                    '2010-2014'
                ]
            };
            
            console.log(' Datos de filtros enviados');
            res.json(filtros);
            
        } catch (error) {
            console.error(' Error en getDatosFiltros:', error);
            res.status(500).json({ 
                error: 'Error al obtener datos de filtros',
                detalle: error.message 
            });
        }
    }

    static completarMesesFaltantes(datos) {
        const mesesCompletos = [];
        
        for (let mes = 1; mes <= 12; mes++) {
            const datoMes = datos.find(d => d.mes === mes);
            mesesCompletos.push({
                mes: mes,
                cantidad: datoMes ? datoMes.cantidad : 0
            });
        }
        
        return mesesCompletos;
    }
}

console.log(' Controlador EstadisticaController cargado correctamente');
console.log('Métodos disponibles:');
console.log('- getEstadisticasGenerales:', typeof EstadisticaController.getEstadisticasGenerales);
console.log('- getPorTipo:', typeof EstadisticaController.getPorTipo);
console.log('- getEvolucionMensual:', typeof EstadisticaController.getEvolucionMensual);
console.log('- getPorPrioridad:', typeof EstadisticaController.getPorPrioridad);
console.log('- getDatosFiltros:', typeof EstadisticaController.getDatosFiltros);

module.exports = EstadisticaController;