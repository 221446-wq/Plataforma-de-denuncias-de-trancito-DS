const db = require('../Config/database');

class User {
    // Buscar usuario por email o username
    static async findByEmailOrUsername(identifier) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM usuarios WHERE correo = ? OR usuario = ?',
                [identifier, identifier]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error en findByEmailOrUsername:', error);
            throw error;
        }
    }

    // Buscar usuario por DNI
    static async findByDni(dni) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM usuarios WHERE dni = ?',
                [dni]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error en findByDni:', error);
            throw error;
        }
    }

    // Crear nuevo usuario
    static async create(userData) {
        try {
            const {
                dni,
                nombres,
                apellidos,
                correo,
                celular,
                usuario,
                password,
                tipo_usuario = 'ciudadano',
                cargo = null,
            } = userData;

            console.log('Creando usuario con datos:', { 
                dni, nombres, usuario, tipo_usuario, cargo 
            });

            const [result] = await db.execute(
                `INSERT INTO usuarios 
                 (dni, nombres, apellidos, correo, celular, usuario, password, tipo_usuario, cargo, fecha_registro) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [dni, nombres, apellidos, correo, celular, usuario, password, tipo_usuario, cargo]
            );

            console.log('Usuario creado con ID:', result.insertId);
            return result.insertId;

        } catch (error) {
            console.error('Error en User.create:', error);
            throw error;
        }
    }

    static async findById(id) {
    try {
        const [rows] = await db.execute(
            'SELECT id, dni, nombres, apellidos, correo, celular, usuario, tipo_usuario, cargo, activo FROM usuarios WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error en findById:', error);
        throw error;
    }
}
}

module.exports = User;