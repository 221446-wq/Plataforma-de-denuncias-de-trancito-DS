const db = require('../Config/database');

class User {
    // Buscar usuario por email o username usando Stored Procedure
    static async findByEmailOrUsername(identifier) {
        try {
            const [rows] = await db.execute(
                'CALL sp_find_user_by_identifier(?)',
                [identifier]
            );
            return rows[0][0] || null;
        } catch (error) {
            console.error('Error en findByEmailOrUsername:', error);
            throw error;
        }
    }

    // Buscar usuario por DNI usando Stored Procedure
    static async findByDni(dni) {
        try {
            const [rows] = await db.execute(
                'CALL sp_find_user_by_dni(?)',
                [dni]
            );
            return rows[0][0] || null;
        } catch (error) {
            console.error('Error en findByDni:', error);
            throw error;
        }
    }

    // Crear nuevo usuario usando Stored Procedure
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
                'CALL sp_create_user(?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [dni, nombres, apellidos, correo, celular, usuario, password, tipo_usuario, cargo]
            );

            const insertId = result[0][0].insertId;
            console.log('Usuario creado con ID:', insertId);
            return insertId;

        } catch (error) {
            console.error('Error en User.create:', error);
            throw error;
        }
    }

    // Buscar usuario por ID usando Stored Procedure
    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'CALL sp_find_user_by_id(?)',
                [id]
            );
            return rows[0][0] || null;
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }
}

module.exports = User;