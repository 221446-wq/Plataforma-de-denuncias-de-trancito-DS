const pool = require('../Config/database');

class Denuncia {
    // Crear denuncia - VERSIÓN CORREGIDA
    static async create(denunciaData) {
        const {
            usuario_id, tipo_denuncia, descripcion, latitud, longitud, direccion,
            archivos_fotos, archivos_videos, archivos_documentos, prioridad
        } = denunciaData;

        console.log('📝 Creando denuncia con datos:', {
            usuario_id, tipo_denuncia, 
            descripcion: descripcion ? descripcion.substring(0, 50) + '...' : 'null',
            latitud, longitud
        });

        // Generar código único para la denuncia
        const timestampPart = Date.now().toString().slice(-9); // Últimos 9 dígitos del timestamp
        const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase(); // 5 caracteres alfanuméricos
        const codigo_denuncia = `DEN-${timestampPart}-${randomPart}`; // Formato: DEN-XXXXXXXXX-ABCDE (19 caracteres)

        // console.log(`Generated codigo_denuncia: ${codigo_denuncia}, Length: ${codigo_denuncia.length}`);

        const query = `
            INSERT INTO denuncias (
                usuario_id, tipo_denuncia, descripcion, latitud, longitud, direccion,
                archivos_fotos, archivos_videos, archivos_documentos, prioridad,
                estado, codigo_denuncia
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'recibido', ?)
        `;

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

        console.log('🔍 Query:', query);
        console.log('📊 Valores:', values);

        try {
            const [result] = await pool.execute(query, values);
            console.log('✅ Denuncia creada con ID:', result.insertId, 'Código:', codigo_denuncia);
            
            return { 
                id: result.insertId, 
                codigo_denuncia: codigo_denuncia 
            };
        } catch (error) {
            console.error('❌ Error en Denuncia.create:');
            console.error('Mensaje:', error.message);
            console.error('Código:', error.code);
            console.error('SQL Message:', error.sqlMessage);
            throw error;
        }
    }

    

    // Obtener todas las denuncias con filtros
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT d.*, u.nombres, u.apellidos
                FROM denuncias d
                JOIN usuarios u ON d.usuario_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.estado) {
                query += ' AND d.estado = ?';
                params.push(filters.estado);
            }

            if (filters.prioridad) {
                query += ' AND d.prioridad = ?';
                params.push(filters.prioridad);
            }

            if (filters.ciudadano) {
                query += ' AND (u.nombres LIKE ? OR u.apellidos LIKE ?)';
                params.push(`%${filters.ciudadano}%`, `%${filters.ciudadano}%`);
            }

            query += ' ORDER BY d.fecha_creacion DESC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error en findAll:', error);
            throw error;
        }
    }

    // Actualizar estado de denuncia
    static async updateEstado(id, estado, comentario = null) {
        try {
            const query = `
                UPDATE denuncias 
                SET estado = ?, fecha_actualizacion = NOW()
                WHERE id = ?
            `;
            await pool.execute(query, [estado, id]);

            // Registrar en el historial
            if (comentario) {
                await this.agregarAlHistorial(id, estado, comentario);
            }
        } catch (error) {
            console.error('Error en updateEstado:', error);
            throw error;
        }
    }

    // Agregar al historial
    static async agregarAlHistorial(denuncia_id, accion, descripcion) {
        try {
            const query = `
                INSERT INTO historial_denuncias (denuncia_id, accion, descripcion, fecha)
                VALUES (?, ?, ?, NOW())
            `;
            await pool.execute(query, [denuncia_id, accion, descripcion]);
        } catch (error) {
            console.error('Error en agregarAlHistorial:', error);
            throw error;
        }
    }

    // Obtener historial de denuncia
    static async getHistorial(denuncia_id) {
        try {
            const query = `
                SELECT * FROM historial_denuncias 
                WHERE denuncia_id = ? 
                ORDER BY fecha DESC
            `;
            const [rows] = await pool.execute(query, [denuncia_id]);
            return rows;
        } catch (error) {
            console.error('Error en getHistorial:', error);
            throw error;
        }
    }
    // En Denuncia.js - agregar este método
    static async findAllWithFilters(filters = {}) {
        try {
            let query = `
                SELECT d.*, u.nombres, u.apellidos, u.dni
                FROM denuncias d
                JOIN usuarios u ON d.usuario_id = u.id
                WHERE 1=1
            `;
            const params = [];

            // Filtro por nombre de ciudadano
            if (filters.ciudadano) {
                query += ' AND (u.nombres LIKE ? OR u.apellidos LIKE ? OR u.dni LIKE ?)';
                const searchTerm = `%${filters.ciudadano}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            // Filtro por estado
            if (filters.estado && filters.estado !== 'Todos los estados') {
                query += ' AND d.estado = ?';
                params.push(filters.estado);
            }

            // Filtro por prioridad
            if (filters.prioridad && filters.prioridad !== 'Todas las prioridades') {
                query += ' AND d.prioridad = ?';
                params.push(filters.prioridad.toLowerCase());
            }

            query += ' ORDER BY d.fecha_creacion DESC';

            console.log('🔍 Query con filtros:', query);
            console.log('📊 Parámetros:', params);

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error en findAllWithFilters:', error);
            throw error;
        }
    }
    
    

    // Obtener comentarios de denuncia
    static async getComentarios(denuncia_id) {
        try {
            const query = `
                SELECT c.*, u.nombres, u.apellidos, u.tipo_usuario
                FROM comentarios_denuncias c
                JOIN usuarios u ON c.usuario_id = u.id
                WHERE c.denuncia_id = ?
                ORDER BY c.fecha DESC
            `;
            const [rows] = await pool.execute(query, [denuncia_id]);
            return rows;
        } catch (error) {
            console.error('Error en getComentarios:', error);
            throw error;
        }
    }
    // Obtener denuncia por ID (numérico)
    static async findById(id) {
        try {
            console.log('🔍 Buscando denuncia con ID:', id);
            
            const query = `
                SELECT d.*, 
                    u.nombres, u.apellidos, u.dni, u.celular, u.correo,
                    u.tipo_usuario
                FROM denuncias d
                JOIN usuarios u ON d.usuario_id = u.id
                WHERE d.id = ?
            `;
            
            const [rows] = await pool.execute(query, [id]);
            
            if (rows.length === 0) {
                console.log('❌ No se encontró denuncia con ID:', id);
                return null;
            }
            
            const denuncia = rows[0];
            
            // Parsear archivos de forma segura
            ['archivos_fotos', 'archivos_videos', 'archivos_documentos'].forEach(key => {
                const value = denuncia[key];
                if (typeof value === 'string' && value.startsWith('[')) {
                    try {
                        denuncia[key] = JSON.parse(value);
                    } catch (e) {
                        denuncia[key] = [];
                    }
                } else if (typeof value === 'string' && value.trim() !== '') {
                    // Si es un string que no es un array JSON (dato antiguo), lo envuelve en un array
                    denuncia[key] = [value];
                } else if (!Array.isArray(value)) {
                    // Si no es un array o un string procesable, se asegura de que sea un array vacío
                    denuncia[key] = [];
                }
            });
            
            console.log('✅ Denuncia encontrada por ID:', denuncia.codigo_denuncia);
            return denuncia;
            
        } catch (error) {
            console.error('❌ Error en findById:', error);
            throw error;
        }
    }

    // Obtener denuncia por código
    static async findByCodigo(codigo) {
        try {
            console.log('🔍 Buscando denuncia con código:', codigo);
            
            const query = `
                SELECT d.*, 
                    u.nombres, u.apellidos, u.dni, u.celular, u.correo,
                    u.tipo_usuario
                FROM denuncias d
                JOIN usuarios u ON d.usuario_id = u.id
                WHERE d.codigo_denuncia = ?
            `;
            
            const [rows] = await pool.execute(query, [codigo]);
            
            if (rows.length === 0) {
                console.log('❌ No se encontró denuncia con código:', codigo);
                return null;
            }
            
            const denuncia = rows[0];
            
            // Parsear archivos de forma segura
            ['archivos_fotos', 'archivos_videos', 'archivos_documentos'].forEach(key => {
                const value = denuncia[key];
                if (typeof value === 'string' && value.startsWith('[')) {
                    try {
                        denuncia[key] = JSON.parse(value);
                    } catch (e) {
                        denuncia[key] = [];
                    }
                } else if (typeof value === 'string' && value.trim() !== '') {
                    // Si es un string que no es un array JSON (dato antiguo), lo envuelve en un array
                    denuncia[key] = [value];
                } else if (!Array.isArray(value)) {
                    // Si no es un array o un string procesable, se asegura de que sea un array vacío
                    denuncia[key] = [];
                }
            });
            
            console.log('✅ Denuncia encontrada por código:', denuncia.codigo_denuncia);
            return denuncia;
            
        } catch (error) {
            console.error('❌ Error en findByCodigo:', error);
            throw error;
        }
    }
    }   

module.exports = Denuncia;