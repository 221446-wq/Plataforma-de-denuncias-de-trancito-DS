const Denuncia = require('../Models/Denuncia');

class DenunciaController {
    static async crearDenuncia(req, res) {
        try {
            console.log('Datos texto recibidos:', req.body);
            // 1. VERIFICAR SI LLEGARON ARCHIVOS
            console.log('Archivos recibidos:', req.files); 

            console.log('Datos recibidos para denuncia:', req.body);
            console.log('Usuario autenticado:', req.user);
            console.log('Archivos recibidos:', req.files); // Log para ver los archivos


            // 2. EXTRAER LOS NOMBRES DE LOS ARCHIVOS (Si existen)
            // Multer guarda los archivos en req.files['nombre_campo']
            const archivos_fotos = req.files && req.files['fotos'] 
                ? req.files['fotos'].map(file => file.filename) 
                : [];
                
            const archivos_videos = req.files && req.files['videos'] 
                ? req.files['videos'].map(file => file.filename) 
                : [];
                
            const archivos_documentos = req.files && req.files['documentos'] 
                ? req.files['documentos'].map(file => file.filename) 
                : [];

            // 3. ARMAR EL OBJETO PARA LA BASE DE DATOS
            const denunciaData = {

                ...req.body, // Trae tipo_denuncia, descripcion, latitud, etc.
                usuario_id: req.user.id,
                archivos_fotos,      // Guardamos el array de nombres
                archivos_videos,
                archivos_documentos

            };

            console.log('Datos a guardar en la BD:', denunciaData); // Log para ver los datos finales


            const result = await Denuncia.create(denunciaData);
            
            res.status(201).json({ 
                message: 'Denuncia registrada exitosamente',
                codigo_denuncia: result.codigo_denuncia 
            });

        } catch (error) {
            console.error('Error al crear denuncia:', error);
            res.status(500).json({ error: 'Error al crear denuncia: ' + error.message });
        }
    }

    static async buscarDenuncia(req, res) {
        try {
            const { codigo } = req.params;
            const denuncia = await Denuncia.findByCodigo(codigo);

            if (!denuncia) {
                return res.status(404).json({ error: 'Denuncia no encontrada' });
            }

            const historial = await Denuncia.getHistorial(denuncia.id);
            denuncia.historial = historial;

            res.json(denuncia);

        } catch (error) {
            console.error('Error al buscar denuncia:', error);
            res.status(500).json({ error: 'Error al buscar denuncia' });
        }
    }

    static async listarDenuncias(req, res) {
        try {
            const filters = {
                ciudadano: req.query.ciudadano,
                estado: req.query.estado,
                prioridad: req.query.prioridad
            };

            console.log(' Filtros recibidos:', filters);

            // Limpiar filtros vacíos
            Object.keys(filters).forEach(key => {
                if (!filters[key] || filters[key] === 'Todos los estados' || filters[key] === 'Todas las prioridades') {
                    delete filters[key];
                }
            });

            let denuncias;
            if (Object.keys(filters).length > 0) {
                denuncias = await Denuncia.findAllWithFilters(filters);
            } else {
                denuncias = await Denuncia.findAll();
            }

            console.log(`Denuncias encontradas: ${denuncias.length}`);
            res.json(denuncias);

        } catch (error) {
            console.error('Error al obtener denuncias:', error);
            res.status(500).json({ error: 'Error al obtener denuncias' });
        }
    }

    static async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado, comentario } = req.body;

            await Denuncia.updateEstado(id, estado, comentario);
            res.json({ message: 'Estado actualizado exitosamente' });

        } catch (error) {
            console.error('Error al actualizar estado:', error);
            res.status(500).json({ error: 'Error al actualizar estado' });
        }
    }
    static async obtenerDenunciaPorId(req, res) {
        try {
            const { id } = req.params;
            console.log(' Controlador: Buscando denuncia con ID:', id);

            // VERIFICACIÓN: ¿Es un ID numérico o un código?
            const esIdNumerico = /^\d+$/.test(id);
            
            let denuncia;
            if (esIdNumerico) {
                // Si es numérico, buscar por ID
                denuncia = await Denuncia.findById(id);
            } else {
                // Si no es numérico, buscar por código
                denuncia = await Denuncia.findByCodigo(id);
            }
            
            if (!denuncia) {
                console.log(' Controlador: Denuncia no encontrada:', id);
                return res.status(404).json({ error: 'Denuncia no encontrada' });
            }

            // Obtener historial
            const historial = await Denuncia.getHistorial(denuncia.id);
            denuncia.historial = historial;

            console.log(' Controlador: Denuncia encontrada:', denuncia.codigo_denuncia);
            res.json(denuncia);

        } catch (error) {
            console.error(' Controlador: Error al obtener denuncia:', error);
            res.status(500).json({ error: 'Error al obtener denuncia: ' + error.message });
        }
    }
    // Buscar denuncia por código (método específico)
    static async obtenerDenunciaPorCodigo(req, res) {
        try {
            const { codigo } = req.params;
            console.log('🔍 Controlador: Buscando denuncia con CÓDIGO:', codigo);

            const denuncia = await Denuncia.findByCodigo(codigo);
            
            if (!denuncia) {
                console.log(' Controlador: Denuncia no encontrada con código:', codigo);
                return res.status(404).json({ error: 'Denuncia no encontrada' });
            }

            // Obtener historial
            const historial = await Denuncia.getHistorial(denuncia.id);
            denuncia.historial = historial;

            console.log(' Controlador: Denuncia encontrada por código:', denuncia.codigo_denuncia);
            res.json(denuncia);

        } catch (error) {
            console.error(' Controlador: Error al obtener denuncia por código:', error);
            res.status(500).json({ error: 'Error al obtener denuncia: ' + error.message });
        }
    }
}

module.exports = DenunciaController;