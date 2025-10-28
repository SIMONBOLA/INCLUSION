-- Crear tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'estudiante',
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de estudiantes
CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    grupo VARCHAR(10) NOT NULL,
    promedio DECIMAL(3,1) DEFAULT 0.0,
    asistencia INTEGER DEFAULT 0,
    notas JSONB DEFAULT '[]'::jsonb,
    historial JSONB DEFAULT '[]'::jsonb,
    progreso JSONB DEFAULT '{}'::jsonb
);

-- Crear tabla de notas
CREATE TABLE notas (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    materia VARCHAR(50) NOT NULL,
    valor DECIMAL(3,1) NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de comentarios
CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    autor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de mensajes
CREATE TABLE mensajes (
    id SERIAL PRIMARY KEY,
    emisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    receptor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT false
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_estudiantes_user ON estudiantes(user_id);
CREATE INDEX idx_notas_estudiante ON notas(estudiante_id);
CREATE INDEX idx_comentarios_estudiante ON comentarios(estudiante_id);
CREATE INDEX idx_mensajes_participantes ON mensajes(emisor_id, receptor_id);

-- Crear funciones útiles
CREATE OR REPLACE FUNCTION actualizar_promedio_estudiante(estudiante_id_param INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    nuevo_promedio DECIMAL(3,1);
BEGIN
    SELECT COALESCE(AVG(valor), 0.0)
    INTO nuevo_promedio
    FROM notas
    WHERE estudiante_id = estudiante_id_param;
    
    UPDATE estudiantes
    SET promedio = nuevo_promedio
    WHERE id = estudiante_id_param;
    
    RETURN nuevo_promedio;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar promedio automáticamente
CREATE OR REPLACE FUNCTION trigger_actualizar_promedio()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM actualizar_promedio_estudiante(NEW.estudiante_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_nota_change
    AFTER INSERT OR UPDATE OR DELETE ON notas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_actualizar_promedio();

-- Insertar algunos roles básicos si no existen
INSERT INTO users (username, password, nombre, role) 
VALUES 
    ('admin', '$2b$10$xZtXF6jB3g5.PRxqZQfXB.3QfYW0APqvJxQxC8c3MeX7pLUeCcEG.', 'Administrador', 'admin'),
    ('profesor', '$2b$10$xZtXF6jB3g5.PRxqZQfXB.3QfYW0APqvJxQxC8c3MeX7pLUeCcEG.', 'Profesor Demo', 'profesor')
ON CONFLICT (username) DO NOTHING;