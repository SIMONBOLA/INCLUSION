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

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    grupo VARCHAR(10) NOT NULL,
    promedio DECIMAL(4,2),
    asistencia INTEGER CHECK (asistencia BETWEEN 0 AND 100),
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    telefono VARCHAR(20),
    direccion TEXT,
    acudiente_nombre VARCHAR(100),
    acudiente_telefono VARCHAR(20)
);

-- Tabla de materias
CREATE TABLE IF NOT EXISTS materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notas
CREATE TABLE IF NOT EXISTS notas (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    materia_id INTEGER REFERENCES materias(id) ON DELETE CASCADE,
    valor DECIMAL(4,2) CHECK (valor BETWEEN 0 AND 10),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    periodo VARCHAR(20) NOT NULL,
    observaciones TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS asistencia (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) CHECK (estado IN ('presente', 'ausente', 'tardanza')),
    justificacion TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial académico
CREATE TABLE IF NOT EXISTS historial_academico (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    emisor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receptor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    autor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de progreso académico
CREATE TABLE IF NOT EXISTS progreso_academico (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    materia_id INTEGER REFERENCES materias(id) ON DELETE CASCADE,
    nivel_logro INTEGER CHECK (nivel_logro BETWEEN 0 AND 100),
    periodo VARCHAR(20) NOT NULL,
    fecha_evaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    observaciones TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_estudiantes_user_id ON estudiantes(user_id);
CREATE INDEX IF NOT EXISTS idx_notas_estudiante_id ON notas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_estudiante_id ON asistencia(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_historial_estudiante_id ON historial_academico(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_emisor_id ON mensajes(emisor_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_receptor_id ON mensajes(receptor_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_estudiante_id ON comentarios(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_progreso_estudiante_id ON progreso_academico(estudiante_id);

-- Vista para resumen de estudiantes
CREATE OR REPLACE VIEW vista_resumen_estudiantes AS
SELECT 
    e.id,
    u.username,
    u.nombre,
    e.grupo,
    e.promedio,
    e.asistencia,
    (SELECT COUNT(*) FROM notas n WHERE n.estudiante_id = e.id) as total_notas,
    (SELECT COUNT(*) FROM comentarios c WHERE c.estudiante_id = e.id) as total_comentarios,
    u.created_at as fecha_registro
FROM estudiantes e
JOIN users u ON e.user_id = u.id
WHERE u.is_active = true;