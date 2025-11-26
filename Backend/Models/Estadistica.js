const pool = require('../Config/database');

class Estadistica {
    static async getEstadisticasGenerales() {
        const query = `
            SELECT 
                COUNT(*) as total_denuncias,
                SUM(CASE WHEN estado = 'recibido' THEN 1 ELSE 0 END) as recibidas,
                SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
                SUM(CASE WHEN estado = 'resuelta' THEN 1 ELSE 0 END) as resueltas,
                SUM(CASE WHEN estado = 'archivada' THEN 1 ELSE 0 END) as archivadas
            FROM denuncias
        `;
        
        try {
            console.log('📊 Ejecutando query de estadísticas generales...');
            const [rows] = await pool.execute(query);
            console.log('✅ Query ejecutada correctamente');
            return rows[0];
        } catch (error) {
            console.error('❌ Error en getEstadisticasGenerales:', error);
            throw error;
        }
    }

    static async getPorTipo() {
        const query = `
            SELECT tipo_denuncia, COUNT(*) as cantidad
            FROM denuncias
            GROUP BY tipo_denuncia
            ORDER BY cantidad DESC
        `;
        
        try {
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            console.error('❌ Error en getPorTipo:', error);
            throw error;
        }
    }

    static async getEvolucionMensual(anio) {
        const query = `
            SELECT 
                MONTH(fecha_creacion) as mes,
                COUNT(*) as cantidad
            FROM denuncias
            WHERE YEAR(fecha_creacion) = ?
            GROUP BY MONTH(fecha_creacion)
            ORDER BY mes
        `;
        
        try {
            const [rows] = await pool.execute(query, [anio]);
            return rows;
        } catch (error) {
            console.error('❌ Error en getEvolucionMensual:', error);
            throw error;
        }
    }

    static async getPorPrioridad() {
        const query = `
            SELECT prioridad, COUNT(*) as cantidad
            FROM denuncias
            GROUP BY prioridad
            ORDER BY cantidad DESC
        `;
        
        try {
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            console.error('❌ Error en getPorPrioridad:', error);
            throw error;
        }
    }
}

console.log('✅ Modelo Estadistica cargado correctamente');

module.exports = Estadistica;