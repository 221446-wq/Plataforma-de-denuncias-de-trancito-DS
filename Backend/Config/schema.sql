drop database  if exists railway ;
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS railway;
USE railway;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dni VARCHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    celular VARCHAR(9),
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('ciudadano', 'funcionario', 'administrador') NOT NULL,
    cargo VARCHAR(100),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de denuncias
CREATE TABLE denuncias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NULL,
    codigo_denuncia VARCHAR(20) UNIQUE NOT NULL,
    tipo_denuncia VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    direccion TEXT,
    archivos_fotos JSON,
    archivos_videos JSON,
    archivos_documentos JSON,
    prioridad ENUM('alta', 'media', 'baja') DEFAULT 'media',
    estado ENUM('recibido', 'en_proceso', 'resuelta', 'archivada') DEFAULT 'recibido',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de historial de denuncias
CREATE TABLE historial_denuncias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    denuncia_id INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id) ON DELETE CASCADE
);

-- Tabla de comentarios
CREATE TABLE comentarios_denuncias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    denuncia_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (dni, nombres, apellidos, correo, celular, usuario, password, tipo_usuario, cargo) 
VALUES ('12345678', 'Admin', 'Sistema', 'admin@municipalidadcusco.gob.pe', '999888777', 'admin', '$2b$12$dmOSy5v6g5qR8cZ6GTY0wu4JLzHMTVBf7z//Xs8MGwUos1C/HIjn2', 'administrador', 'Administrador del Sistema');

-- Crear índices para mejor performance
CREATE INDEX idx_denuncias_estado ON denuncias(estado);
CREATE INDEX idx_denuncias_fecha ON denuncias(fecha_creacion);
CREATE INDEX idx_denuncias_usuario ON denuncias(usuario_id);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);

-- -----------------------------------------------------
-- Stored Procedures
-- -----------------------------------------------------

DELIMITER $$

--
-- Procedimientos para la tabla `usuarios`
--
CREATE PROCEDURE `sp_find_user_by_identifier`(IN p_identifier VARCHAR(255))
BEGIN
    SELECT * FROM usuarios WHERE correo = p_identifier OR usuario = p_identifier;
END$$

CREATE PROCEDURE `sp_find_user_by_dni`(IN p_dni VARCHAR(20))
BEGIN
    SELECT * FROM usuarios WHERE dni = p_dni;
END$$

CREATE PROCEDURE `sp_create_user`(
    IN p_dni VARCHAR(8), 
    IN p_nombres VARCHAR(100), 
    IN p_apellidos VARCHAR(100), 
    IN p_correo VARCHAR(150), 
    IN p_celular VARCHAR(9), 
    IN p_usuario VARCHAR(50), 
    IN p_password VARCHAR(255), 
    IN p_tipo_usuario ENUM('ciudadano', 'funcionario', 'administrador'), 
    IN p_cargo VARCHAR(100)
)
BEGIN
    INSERT INTO usuarios 
        (dni, nombres, apellidos, correo, celular, usuario, password, tipo_usuario, cargo, fecha_registro) 
    VALUES 
        (p_dni, p_nombres, p_apellidos, p_correo, p_celular, p_usuario, p_password, p_tipo_usuario, p_cargo, NOW());
    
    SELECT LAST_INSERT_ID() as insertId;
END$$

CREATE PROCEDURE `sp_find_user_by_id`(IN p_id INT)
BEGIN
    SELECT id, dni, nombres, apellidos, correo, celular, usuario, tipo_usuario, cargo, activo 
    FROM usuarios 
    WHERE id = p_id;
END$$

--
-- Procedimientos para la tabla `denuncias`
--
CREATE PROCEDURE `sp_create_denuncia`(
    IN p_usuario_id INT,
    IN p_tipo_denuncia VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_latitud DECIMAL(10, 8),
    IN p_longitud DECIMAL(11, 8),
    IN p_direccion TEXT,
    IN p_archivos_fotos JSON,
    IN p_archivos_videos JSON,
    IN p_archivos_documentos JSON,
    IN p_prioridad ENUM('alta', 'media', 'baja'),
    IN p_codigo_denuncia VARCHAR(20)
)
BEGIN
    INSERT INTO denuncias (
        usuario_id, tipo_denuncia, descripcion, latitud, longitud, direccion,
        archivos_fotos, archivos_videos, archivos_documentos, prioridad,
        estado, codigo_denuncia
    ) VALUES (
        p_usuario_id, p_tipo_denuncia, p_descripcion, p_latitud, p_longitud, p_direccion,
        p_archivos_fotos, p_archivos_videos, p_archivos_documentos, p_prioridad, 
        'recibido', p_codigo_denuncia
    );
    SELECT LAST_INSERT_ID() as insertId;
END$$

CREATE PROCEDURE `sp_find_denuncia_by_id`(IN p_id INT)
BEGIN
    SELECT d.*, u.nombres, u.apellidos, u.dni, u.celular, u.correo, u.tipo_usuario
    FROM denuncias d
    LEFT JOIN usuarios u ON d.usuario_id = u.id
    WHERE d.id = p_id;
END$$

CREATE PROCEDURE `sp_find_denuncia_by_codigo`(IN p_codigo VARCHAR(20))
BEGIN
    SELECT d.*, u.nombres, u.apellidos, u.dni, u.celular, u.correo, u.tipo_usuario
    FROM denuncias d
    LEFT JOIN usuarios u ON d.usuario_id = u.id
    WHERE d.codigo_denuncia = p_codigo;
END$$

CREATE PROCEDURE `sp_update_denuncia_estado`(IN p_id INT, IN p_estado VARCHAR(50))
BEGIN
    UPDATE denuncias 
    SET estado = p_estado, fecha_actualizacion = NOW()
    WHERE id = p_id;
END$$

CREATE PROCEDURE `sp_add_historial_denuncia`(IN p_denuncia_id INT, IN p_accion VARCHAR(50), IN p_descripcion TEXT)
BEGIN
    INSERT INTO historial_denuncias (denuncia_id, accion, descripcion, fecha)
    VALUES (p_denuncia_id, p_accion, p_descripcion, NOW());
END$$

CREATE PROCEDURE `sp_get_historial_denuncia`(IN p_denuncia_id INT)
BEGIN
    SELECT * FROM historial_denuncias 
    WHERE denuncia_id = p_denuncia_id 
    ORDER BY fecha DESC;
END$$

CREATE PROCEDURE `sp_get_comentarios_denuncia`(IN p_denuncia_id INT)
BEGIN
    SELECT c.*, u.nombres, u.apellidos, u.tipo_usuario
    FROM comentarios_denuncias c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.denuncia_id = p_denuncia_id
    ORDER BY c.fecha DESC;
END$$

CREATE PROCEDURE `sp_find_all_denuncias_with_filters`(
    IN p_ciudadano VARCHAR(255),
    IN p_estado VARCHAR(50),
    IN p_prioridad VARCHAR(50)
)
BEGIN
    SELECT d.*, u.nombres, u.apellidos, u.dni
    FROM denuncias d
    LEFT JOIN usuarios u ON d.usuario_id = u.id
    WHERE 
        (p_ciudadano IS NULL OR p_ciudadano = '' OR u.nombres LIKE CONCAT('%', p_ciudadano, '%') OR u.apellidos LIKE CONCAT('%', p_ciudadano, '%') OR u.dni LIKE CONCAT('%', p_ciudadano, '%'))
    AND 
        (p_estado IS NULL OR p_estado = '' OR p_estado = 'Todos los estados' OR d.estado = p_estado)
    AND 
        (p_prioridad IS NULL OR p_prioridad = '' OR p_prioridad = 'Todas las prioridades' OR d.prioridad = p_prioridad)
    ORDER BY d.fecha_creacion DESC;
END$$

--
-- Procedimientos para la tabla `estadisticas`
--
CREATE PROCEDURE `sp_get_estadisticas_generales`()
BEGIN
    SELECT 
        COUNT(*) as total_denuncias,
        SUM(CASE WHEN estado = 'recibido' THEN 1 ELSE 0 END) as recibidas,
        SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'resuelta' THEN 1 ELSE 0 END) as resueltas,
        SUM(CASE WHEN estado = 'archivada' THEN 1 ELSE 0 END) as archivadas
    FROM denuncias;
END$$

CREATE PROCEDURE `sp_get_estadisticas_por_tipo`()
BEGIN
    SELECT tipo_denuncia, COUNT(*) as cantidad
    FROM denuncias
    GROUP BY tipo_denuncia
    ORDER BY cantidad DESC;
END$$

CREATE PROCEDURE `sp_get_estadisticas_evolucion_mensual`(IN p_anio INT)
BEGIN
    SELECT 
        MONTH(fecha_creacion) as mes,
        COUNT(*) as cantidad
    FROM denuncias
    WHERE YEAR(fecha_creacion) = p_anio
    GROUP BY MONTH(fecha_creacion)
    ORDER BY mes;
END$$

CREATE PROCEDURE `sp_get_estadisticas_por_prioridad`()
BEGIN
    SELECT prioridad, COUNT(*) as cantidad
    FROM denuncias
    GROUP BY prioridad
    ORDER BY cantidad DESC;
END$$

DELIMITER ;