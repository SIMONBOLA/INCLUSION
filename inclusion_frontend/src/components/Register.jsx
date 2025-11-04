import { useState, useEffect, useRef } from 'react';
import registerService from '../services/register';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    role: 'estudiante',
    grupo: ''
  });
  
  const [showGrupo, setShowGrupo] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const mensajeTimeoutRef = useRef(null);
  const TIEMPO_MENSAJE = 4000;

  const mostrarMensajeTemporal = (tipo, texto) => {
    if (mensajeTimeoutRef.current) {
      clearTimeout(mensajeTimeoutRef.current);
      setMensaje(null);
    }
    setMensaje({ tipo, texto });
    mensajeTimeoutRef.current = setTimeout(() => {
      setMensaje(null);
      mensajeTimeoutRef.current = null;
    }, TIEMPO_MENSAJE);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, TIEMPO_MENSAJE);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje(null);
      }, TIEMPO_MENSAJE);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    
    try {
      const response = await registerService.register(formData);
      if (response && response.user) {
        setMensaje({
          tipo: 'notification-success',
          texto: 'Usuario registrado exitosamente'
        });
        setFormData({
          username: '',
          password: '',
          nombre: '',
          role: 'estudiante',
          grupo: ''
        });
      } else {
        throw new Error('Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setMensaje({
        tipo: 'notification-error',
        texto: error.error || error.message || 'Error al registrar usuario'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mostrar/ocultar campo de grupo según el rol seleccionado
    if (name === 'role') {
      setShowGrupo(value === 'estudiante');
    }
  };

  return (
    <>
      {mensaje && (
        <div className={`notification ${mensaje.tipo}`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: mensaje.tipo === 'notification-success' ? '#4CAF50' : '#f44336',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '4px',
          zIndex: 1000,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {mensaje.texto}
        </div>
      )}
      <div>
        <h2 className="register-title">Registro de Usuario</h2>
        <form onSubmit={handleSubmit} className="register-form">
        
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Rol:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="estudiante">Estudiante</option>
            <option value="profesor">Profesor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {showGrupo && (
          <div className="form-group">
            <label htmlFor="grupo">Grupo:</label>
            <input
              type="text"
              id="grupo"
              name="grupo"
              value={formData.grupo}
              onChange={handleChange}
              placeholder="Ej: 1A, 2B, 3C..."
              required={formData.role === 'estudiante'}
            />
            <small className="input-help" style={{color:"#000"}}>Ingrese el grupo del estudiante (ej: 1A, 2B, etc.)</small>
          </div>
        )}

        <button type="submit" className="submit-button">
          Registrar
        </button>
      </form>
    </div>
    </>
  );
};

export default Register;