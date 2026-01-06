const Denuncia = require('../Models/Denuncia');
const cloudinary = require('cloudinary').v2;
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios'); // Import axios

// !! IMPORTANTE !!
// Configura Cloudinary con tus credenciales. 
// Es una MEJOR PRÁCTICA guardarlas como variables de entorno en tu servidor (Render) y no escribirlas directamente aquí.
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Reemplaza con tu Cloud Name o usa variable de entorno
  api_key: process.env.CLOUDINARY_API_KEY,       // Reemplaza con tu API Key o usa variable de entorno
  api_secret: process.env.CLOUDINARY_API_SECRET  // Reemplaza con tu API Secret o usa variable de entorno
});

// Función para subir un archivo a Cloudinary desde un buffer
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};


class DenunciaController {
    static async crearDenuncia(req, res) {
        try {
            console.log('Datos recibidos para denuncia:', req.body);
            console.log('Usuario autenticado:', req.user);
            console.log('Archivos recibidos en memoria:', req.files ? req.files.length : 0);

            let archivosUrls = [];
            if (req.files && req.files.length > 0) {
                // Mapear cada archivo a una promesa de subida a Cloudinary
                const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
                
                // Esperar a que todas las imágenes se suban
                const uploadResults = await Promise.all(uploadPromises);
                
                // Extraer las URLs seguras de los resultados
                archivosUrls = uploadResults.map(result => result.secure_url);
            }

            let usuario_id = null;
            if (req.user) {
                usuario_id = req.user.id;
            } else {
                // Handle anonymous user
                let anonymousUser = await User.findByEmailOrUsername('anonymous');
                if (!anonymousUser) {
                    // Create anonymous user
                    const randomPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = await bcrypt.hash(randomPassword, 12);
                    const anonymousUserData = {
                        dni: '00000000',
                        nombres: 'Usuario',
                        apellidos: 'Anónimo',
                        correo: 'anonymous@anonymous.com',
                        celular: '999999999',
                        usuario: 'anonymous',
                        password: hashedPassword,
                        tipo_usuario: 'ciudadano',
                        cargo: 'N/A'
                    };
                    const userId = await User.create(anonymousUserData);
                    anonymousUser = { id: userId };
                }
                usuario_id = anonymousUser.id;
            }

            const denunciaData = {
                ...req.body,
                // Asignar el ID de usuario si está autenticado, o null si es anónimo
                usuario_id: usuario_id,
                // Guardar las URLs de Cloudinary en la base de datos
                archivos_fotos: archivosUrls
            };

            console.log('Datos a guardar en la BD (con URLs de Cloudinary):', denunciaData);

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

            console.log('🎯 Filtros recibidos:', filters);

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

            console.log(`📊 Denuncias encontradas: ${denuncias.length}`);
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
            console.log('🔍 Controlador: Buscando denuncia con ID:', id);

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
                console.log('❌ Controlador: Denuncia no encontrada:', id);
                return res.status(404).json({ error: 'Denuncia no encontrada' });
            }

            // Obtener historial
            const historial = await Denuncia.getHistorial(denuncia.id);
            denuncia.historial = historial;

            console.log('✅ Controlador: Denuncia encontrada:', denuncia.codigo_denuncia);
            res.json(denuncia);

        } catch (error) {
            console.error('❌ Controlador: Error al obtener denuncia:', error);
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
                console.log('❌ Controlador: Denuncia no encontrada con código:', codigo);
                return res.status(404).json({ error: 'Denuncia no encontrada' });
            }

            // Obtener historial
            const historial = await Denuncia.getHistorial(denuncia.id);
            denuncia.historial = historial;

            console.log('✅ Controlador: Denuncia encontrada por código:', denuncia.codigo_denuncia);
            res.json(denuncia);

        } catch (error) {
            console.error('❌ Controlador: Error al obtener denuncia por código:', error);
            res.status(500).json({ error: 'Error al obtener denuncia: ' + error.message });
        }
    }

    // Nuevo método para consultar DNI
    static async consultarDNI(req, res) {
        const { dni } = req.params;
        const apiPeruToken = process.env.APIPERU_TOKEN;

        // 1. Validar que el DNI tenga 8 dígitos
        if (!dni || !/^\d{8}$/.test(dni)) {
            return res.status(400).json({ success: false, message: 'El DNI debe tener 8 dígitos numéricos.' });
        }

        if (!apiPeruToken) {
            console.error('APIPERU_TOKEN no está configurado en las variables de entorno.');
            return res.status(500).json({ success: false, message: 'Error de configuración del servidor (token API).' });
        }

        try {
            const apiUrl = `https://apiperu.dev/api/dni/${dni}?api_token=${apiPeruToken}`;
            const response = await axios.get(apiUrl);

            const data = response.data;

            // Validar la respuesta de la API
            if (data.success && data.data) {
                const { nombres, apellido_paterno, apellido_materno } = data.data;
                res.status(200).json({ 
                    success: true,
                    data: { nombres, apellido_paterno, apellido_materno }
                });
            } else if (data.message) {
                // Mensaje de error de la API (ej. "No se encontró el DNI")
                res.status(404).json({ success: false, message: data.message });
            } else {
                // Otro tipo de error o formato inesperado
                res.status(500).json({ success: false, message: 'Error al consultar DNI: Respuesta inesperada de la API.' });
            }

        } catch (error) {
            console.error('Error al consultar DNI con apiperu.dev:', error.message);
            if (error.response) {
                // La API de apiperu.dev respondió con un estado de error
                console.error('Datos de error de apiperu.dev:', error.response.data);
                res.status(error.response.status).json({ success: false, message: error.response.data.message || 'Error de la API externa.' });
            } else if (error.request) {
                // La petición fue hecha pero no hubo respuesta
                res.status(500).json({ success: false, message: 'No se recibió respuesta de apiperu.dev.' });
            } else {
                // Algo más causó el error
                res.status(500).json({ success: false, message: 'Error interno al procesar la solicitud DNI.' });
            }
        }
    }
}

module.exports = DenunciaController;