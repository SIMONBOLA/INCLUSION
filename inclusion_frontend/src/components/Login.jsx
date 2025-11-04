import { useState } from "react"; // Añade este import
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../login2.css";
import registerService from "../services/register";
import loginService from '../services/login';

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      if (!username || !password) {
        setError('Por favor ingrese usuario y contraseña');
        return;
      }

      const user = await loginService.login({
        username,
        password,
      });
      
      if (user) {
        window.localStorage.setItem('loggedUser', JSON.stringify(user));
        setUsername('');
        setPassword('');
        setError(null);
        // Recargar la página después de iniciar sesión
        window.location.reload();
        // La navegación ocurrirá automáticamente por el sistema de rutas
      }
    } catch (error) {
      console.error('Error details:', error);
      setError(error.response?.data?.error || 'Usuario o contraseña incorrectos');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    const nombre = document.getElementById("reg-display-name").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const role = document.getElementById("reg-role").value;

    if (!username || !password) {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      await registerService.register({
        username,
        nombre,
        password,
        role,
      });
      // Limpiar los campos después del registro exitoso
      document.getElementById("reg-username").value = "";
      document.getElementById("reg-display-name").value = "";
      document.getElementById("reg-password").value = "";
      document.getElementById("reg-role").value = "estudiante";
      
      // Mostrar mensaje de éxito y redirigir
      alert("Usuario registrado exitosamente");
      navigate('/login');
    } catch (error) {
      // Solo mostrar error si es realmente necesario
      if (error.response?.data?.error === 'El nombre de usuario ya está en uso') {
        alert("El nombre de usuario ya está en uso");
      }
    }
  };

  return (
    <div className="auth-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="welcome-section">
        <h1>Bienvenido a <span>INCLUSION</span></h1>
      </div>

      <div className="auth-form-container">
        <div className="auth-form">
          <h3>Iniciar sesión</h3>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="login-button">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Eliminamos PropTypes ya que no usamos props
export default LoginForm;