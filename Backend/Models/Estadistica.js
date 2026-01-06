const pool = require('../Config/database');

class Estadistica {
    static async getEstadisticasGenerales() {
        try {
            console.log('📊 Ejecutando SP de estadísticas generales...');
            const [rows] = await pool.execute('CALL sp_get_estadisticas_generales()');
            console.log('✅ SP ejecutado correctamente');
            return rows[0][0];
        } catch (error) {
            console.error('❌ Error en getEstadisticasGenerales:', error);
            throw error;
        }
    }

    static async getPorTipo() {
        try {
            const [rows] = await pool.execute('CALL sp_get_estadisticas_por_tipo()');
            return rows[0];
        } catch (error) {
            console.error('❌ Error en getPorTipo:', error);
            throw error;
        }
    }

    static async getEvolucionMensual(anio) {
        try {
            const [rows] = await pool.execute('CALL sp_get_estadisticas_evolucion_mensual(?)', [anio]);
            return rows[0];
        } catch (error) {
            console.error('❌ Error en getEvolucionMensual:', error);
            throw error;
        }
    }

    static async getPorPrioridad() {
        try {
            const [rows] = await pool.execute('CALL sp_get_estadisticas_por_prioridad()');
            return rows[0];
        } catch (error) {
            console.error('❌ Error en getPorPrioridad:', error);
            throw error;
        }
    }
}

console.log('✅ Modelo Estadistica cargado correctamente');

module.exports = Estadistica;