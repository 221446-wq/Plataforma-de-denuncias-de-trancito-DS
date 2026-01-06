const pool = require('../Config/database');

class Denuncia {
    static async create(denunciaData) {
        const {
            usuario_id, tipo_denuncia, descripcion, latitud, longitud, direccion,
            archivos_fotos, archivos_videos, archivos_documentos, prioridad
        } = denunciaData;

        const timestampPart = Date.now().toString().slice(-9);
        const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase();
        const codigo_denuncia = `DEN-${timestampPart}-${randomPart}`;

        const values = [
            usuario_id,
            tipo_denuncia,
            descripcion,
            latitud,
            longitud,
            direccion,
            JSON.stringify(archivos_fotos || []),
            JSON.stringify(archivos_videos || []),
            JSON.stringify(archivos_documentos || []),
            prioridad || 'media',
            codigo_denuncia
        ];

        try {
            const [result] = await pool.execute('CALL sp_create_denuncia(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values);
            const insertId = result[0][0].insertId;
            console.log('✅ Denuncia creada con ID:', insertId, 'Código:', codigo_denuncia);
            return {
                id: insertId,
                codigo_denuncia: codigo_denuncia
            };
        } catch (error) {
            console.error('❌ Error en Denuncia.create:', error);
            throw error;
        }
    }

    static async updateEstado(id, estado, comentario = null) {
        try {
            await pool.execute('CALL sp_update_denuncia_estado(?, ?)', [id, estado]);

            if (comentario) {
                await this.agregarAlHistorial(id, estado, comentario);
            }
        } catch (error) {
            console.error('Error en updateEstado:', error);
            throw error;
        }
    }

    static async agregarAlHistorial(denuncia_id, accion, descripcion) {
        try {
            await pool.execute('CALL sp_add_historial_denuncia(?, ?, ?)', [denuncia_id, accion, descripcion]);
        } catch (error) {
            console.error('Error en agregarAlHistorial:', error);
            throw error;
        }
    }

    static async getHistorial(denuncia_id) {
        try {
            const [rows] = await pool.execute('CALL sp_get_historial_denuncia(?)', [denuncia_id]);
            return rows[0];
        } catch (error) {
            console.error('Error en getHistorial:', error);
            throw error;
        }
    }

    static async findAllWithFilters(filters = {}) {
        try {
            const params = [
                filters.ciudadano || null,
                filters.estado || null,
                filters.prioridad ? filters.prioridad.toLowerCase() : null
            ];
            
            const [rows] = await pool.execute('CALL sp_find_all_denuncias_with_filters(?, ?, ?)', params);
            return rows[0];
        } catch (error) {
            console.error('Error en findAllWithFilters:', error);
            throw error;
        }
    }

    static async getComentarios(denuncia_id) {
        try {
            const [rows] = await pool.execute('CALL sp_get_comentarios_denuncia(?)', [denuncia_id]);
            return rows[0];
        } catch (error) {
            console.error('Error en getComentarios:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute('CALL sp_find_denuncia_by_id(?)', [id]);
            if (rows[0].length === 0) return null;
            
            const denuncia = rows[0][0];
            this.parseArchivos(denuncia);
            return denuncia;
        } catch (error) {
            console.error('❌ Error en findById:', error);
            throw error;
        }
    }

    static async findByCodigo(codigo) {
        try {
            const [rows] = await pool.execute('CALL sp_find_denuncia_by_codigo(?)', [codigo]);
            if (rows[0].length === 0) return null;

            const denuncia = rows[0][0];
            this.parseArchivos(denuncia);
            return denuncia;
        } catch (error) {
            console.error('❌ Error en findByCodigo:', error);
            throw error;
        }
    }

    static parseArchivos(denuncia) {
        ['archivos_fotos', 'archivos_videos', 'archivos_documentos'].forEach(key => {
            const value = denuncia[key];
            if (typeof value === 'string') {
                try {
                    denuncia[key] = JSON.parse(value);
                } catch (e) {
                    denuncia[key] = value.trim() !== '' ? [value] : [];
                }
            } else if (!Array.isArray(value)) {
                denuncia[key] = [];
            }
        });
    }
}

module.exports = Denuncia;