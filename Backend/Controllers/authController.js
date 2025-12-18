const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// LOGIN
exports.login = async (req, res) => {
    try {
        const { usuario, password, tipo_usuario } = req.body;

        console.log('=== LOGIN SOLICITADO ===');
        console.log('Usuario:', usuario);
        console.log('Tipo usuario solicitado:', tipo_usuario);

        // Validar campos requeridos
        if (!usuario || !password || !tipo_usuario) {
            return res.status(400).json({ error: 'Usuario, contraseña y tipo de usuario son requeridos' });
        }

        // Buscar usuario
        const user = await User.findByEmailOrUsername(usuario);
        if (!user) {
            console.log('Usuario no encontrado:', usuario);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('Usuario encontrado:', user.usuario);
        console.log('Tipo de usuario en BD:', user.tipo_usuario);

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Contraseña incorrecta para usuario:', usuario);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        

        // Verificar tipo de usuario
        if (user.tipo_usuario !== tipo_usuario) {
            return res.status(403).json({ 
                error: `No tiene permisos para acceder como ${tipo_usuario}. Su tipo de usuario es: ${user.tipo_usuario}` 
            });
        }

        // Generar token
        const token = jwt.sign(
            { 
                id: user.id, 
                tipo_usuario: user.tipo_usuario,
                usuario: user.usuario
            },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '24h' }
        );

        console.log('Login exitoso para usuario:', user.usuario);

        res.json({
            token,
            user: {
                id: user.id,
                dni: user.dni,
                nombres: user.nombres,
                apellidos: user.apellidos,
                correo: user.correo,
                celular: user.celular,
                usuario: user.usuario,
                tipo_usuario: user.tipo_usuario,
                cargo: user.cargo,
            }
        });

    } catch (error) {
        console.error('Error detallado en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// REGISTRO DE CIUDADANO
exports.register = async (req, res) => {
    try {
        const { dni, nombres, apellidos, correo, celular, usuario, password } = req.body;
        
        console.log('=== REGISTRO DE CIUDADANO SOLICITADO ===');
        console.log('Datos:', { dni, nombres, usuario });

        // Validar campos requeridos
        if (!dni || !nombres || !apellidos || !correo || !usuario || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Validar longitud de DNI
        if (dni.length !== 8) {
            return res.status(400).json({ error: 'El DNI debe tener 8 dígitos' });
        }

        // Verificar si el DNI ya existe
        const existingDni = await User.findByDni(dni);
        if (existingDni) {
            return res.status(400).json({ error: 'El DNI ya está registrado' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmailOrUsername(usuario);
        if (existingUser) {
            return res.status(400).json({ error: 'El nombre de usuario ya existe' });
        }

        // Verificar si el correo ya existe
        const existingEmail = await User.findByEmailOrUsername(correo);
        if (existingEmail) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userData = {
            dni,
            nombres,
            apellidos,
            correo,
            celular,
            usuario,
            password: hashedPassword,
            tipo_usuario: 'ciudadano'
        };

        const userId = await User.create(userData);
        
        console.log('Usuario ciudadano registrado exitosamente. ID:', userId);
        
        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            id: userId,
            usuario: userData.usuario
        });
        
    } catch (error) {
        console.error('Error en registro ciudadano:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('dni')) {
                res.status(400).json({ error: 'El DNI ya está registrado' });
            } else if (error.sqlMessage.includes('correo')) {
                res.status(400).json({ error: 'El correo electrónico ya está registrado' });
            } else if (error.sqlMessage.includes('usuario')) {
                res.status(400).json({ error: 'El nombre de usuario ya existe' });
            } else {
                res.status(400).json({ error: 'El usuario ya existe' });
            }
        } else {
            res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
        }
    }
};

// REGISTRO DE FUNCIONARIO
exports.registerFuncionario = async (req, res) => {
    try {
        const { dni, nombres, apellidos, correo, celular, usuario, password, cargo } = req.body;
        
        console.log('=== REGISTRO DE FUNCIONARIO SOLICITADO ===');
        console.log('Datos recibidos:', { 
            dni, 
            nombres, 
            apellidos, 
            correo, 
            celular: celular ? '***' : 'null',
            usuario, 
            password: password ? '***' : 'null', 
            cargo 
        });

        // Validar campos requeridos
        if (!dni || !nombres || !apellidos || !correo || !celular || !usuario || !password || !cargo) {
            console.log('Error: Campos requeridos faltantes');
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos',
                camposFaltantes: {
                    dni: !dni,
                    nombres: !nombres,
                    apellidos: !apellidos,
                    correo: !correo,
                    celular: !celular,
                    usuario: !usuario,
                    password: !password,
                    cargo: !cargo
                }
            });
        }

        // Validar longitud de DNI
        if (dni.length !== 8) {
            console.log('Error: DNI no tiene 8 dígitos');
            return res.status(400).json({ error: 'El DNI debe tener 8 dígitos' });
        }

        // Validar longitud de celular
        if (celular.length !== 9) {
            console.log('Error: Celular no tiene 9 dígitos');
            return res.status(400).json({ error: 'El celular debe tener 9 dígitos' });
        }

        console.log('Verificando duplicados...');

        // Verificar si el DNI ya existe
        const existingDni = await User.findByDni(dni);
        if (existingDni) {
            console.log('Error: DNI ya existe:', dni);
            return res.status(400).json({ error: 'El DNI ya está registrado' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmailOrUsername(usuario);
        if (existingUser) {
            console.log('Error: Usuario ya existe:', usuario);
            return res.status(400).json({ error: 'El nombre de usuario ya existe' });
        }

        // Verificar si el correo ya existe
        const existingEmail = await User.findByEmailOrUsername(correo);
        if (existingEmail) {
            console.log('Error: Correo ya existe:', correo);
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        console.log('No hay duplicados, procediendo con registro...');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Contraseña hasheada correctamente');
        
        const userData = {
            dni,
            nombres,
            apellidos,
            correo,
            celular,
            usuario,
            password: hashedPassword,
            tipo_usuario: 'funcionario',
            cargo: cargo
        };

        console.log('Creando usuario en la base de datos...');
        const userId = await User.create(userData);
        console.log('Funcionario creado exitosamente con ID:', userId);
        
        res.status(201).json({ 
            message: 'Funcionario registrado exitosamente', 
            id: userId,
            usuario: userData.usuario,
            cargo: userData.cargo
        });
        
    } catch (error) {
        console.error('=== ERROR EN REGISTRO DE FUNCIONARIO ===');
        console.error('Error completo:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
        
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('dni')) {
                res.status(400).json({ error: 'El DNI ya está registrado' });
            } else if (error.sqlMessage.includes('correo')) {
                res.status(400).json({ error: 'El correo electrónico ya está registrado' });
            } else if (error.sqlMessage.includes('usuario')) {
                res.status(400).json({ error: 'El nombre de usuario ya existe' });
            } else {
                res.status(400).json({ error: 'El usuario ya existe' });
            }
        } else {
            res.status(500).json({ 
                error: 'Error interno del servidor: ' + error.message,
                detalle: error.stack
            });
        }
    }
    
};