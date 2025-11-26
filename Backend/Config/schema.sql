-- Crear base de datos
CREATE DATABASE IF NOT EXISTS plataforma_denuncias;
USE plataforma_denuncias;

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
    usuario_id INT NOT NULL,
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
VALUES ('12345678', 'Admin', 'Sistema', 'admin@municusco.gob.pe', '999888777', 'admin', '$2b$10$YourHashedPasswordHere', 'administrador', 'Administrador del Sistema');

-- Crear índices para mejor performance
CREATE INDEX idx_denuncias_estado ON denuncias(estado);
CREATE INDEX idx_denuncias_fecha ON denuncias(fecha_creacion);
CREATE INDEX idx_denuncias_usuario ON denuncias(usuario_id);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);