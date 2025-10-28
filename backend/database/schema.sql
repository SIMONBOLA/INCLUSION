-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'profesor', 'estudiante')),
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de grupos/cursos
CREATE TABLE IF NOT EXISTS grupos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    grupo_id INTEGER REFERENCES grupos(id),
    codigo_estudiante VARCHAR(20) UNIQUE,
    promedio DECIMAL(4,2),
    asistencia INTEGER CHECK (asistencia BETWEEN 0 AND 100),
    fecha_ingreso DATE,
    acudiente_nombre VARCHAR(100),
    acudiente_telefono VARCHAR(20),
    acudiente_email VARCHAR(100),
    direccion TEXT,
    observaciones TEXT
);

-- Tabla de materias
CREATE TABLE IF NOT EXISTS materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de notas
CREATE TABLE IF NOT EXISTS notas (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    materia_id INTEGER REFERENCES materias(id),
    profesor_id INTEGER REFERENCES users(id),
    valor DECIMAL(4,2) CHECK (valor BETWEEN 0 AND 10),
    fecha DATE NOT NULL,
    periodo VARCHAR(20),
    tipo_evaluacion VARCHAR(50),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS asistencia (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('presente', 'ausente', 'tardanza', 'justificado')),
    justificacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de progreso académico
CREATE TABLE IF NOT EXISTS progreso_academico (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    materia_id INTEGER REFERENCES materias(id),
    periodo VARCHAR(20),
    promedio_actual DECIMAL(4,2),
    asistencia_periodo INTEGER CHECK (asistencia_periodo BETWEEN 0 AND 100),
    observaciones TEXT,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes/chat
CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    emisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    receptor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    contenido TEXT NOT NULL,
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT false,
    fecha_lectura TIMESTAMP WITH TIME ZONE
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    autor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    contenido TEXT NOT NULL,
    tipo VARCHAR(50),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de historial académico
CREATE TABLE IF NOT EXISTS historial_academico (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    tipo_registro VARCHAR(50),
    descripcion TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contactos de emergencia
CREATE TABLE IF NOT EXISTS contactos_emergencia (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    relacion VARCHAR(50),
    telefono VARCHAR(20),
    telefono_alternativo VARCHAR(20),
    direccion TEXT,
    is_primary BOOLEAN DEFAULT false
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_estudiantes_grupo ON estudiantes(grupo_id);
CREATE INDEX IF NOT EXISTS idx_notas_estudiante ON notas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_estudiante ON asistencia(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_chat ON mensajes(emisor_id, receptor_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_estudiante ON comentarios(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);