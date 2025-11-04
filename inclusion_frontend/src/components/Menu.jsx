import { useState } from 'react';
import { Link } from 'react-router-dom';
import "./menu.css";

const Menu = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem('loggedUser'));
  const isAdmin = user?.role === 'admin';

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    // Eliminar el usuario del localStorage
    window.localStorage.removeItem('loggedUser');
    // Recargar la página
    window.location.reload();
    // La navegación al login ocurrirá automáticamente por el sistema de rutas
  };

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>INCLUSION</h2>
        <button className="toggle-button" onClick={toggleMenu}>
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>
      <div className="sidebar-menu">
        <div className="menu-item">
          <Link to="/">
            <i className="fas fa-home"></i>
            <span>Inicio</span>
          </Link>
        </div>
        {isAdmin && (
          <div className="menu-item">
            <Link to="/gestion-usuarios">
              <i className="fas fa-users-cog"></i>
              <span>Gestión Usuarios</span>
            </Link>
          </div>
        )}
        <div className="menu-item">
          <Link to="/notas">
            <i className="fas fa-book"></i>
            <span>Notas</span>
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/graficas">
            <i className="fas fa-chart-bar"></i>
            <span>Gráficas</span>
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/analiticas">
            <i className="fas fa-chart-line"></i>
            <span>Analíticas</span>
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/contactanos">
            <i className="fas fa-envelope"></i>
            <span>Contáctanos</span>
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/sobre-nosotros">
            <i className="fas fa-info-circle"></i>
            <span>Sobre Nosotros</span>
          </Link>
        </div>
        <div className="menu-item logout-item">
          <button onClick={handleLogout} className="menu-button">
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Menu;