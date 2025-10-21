import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profilephoto from "/batman-8510027_1280.png";
import '../inicio.css';



const Inicio = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser');
    if (loggedUser) {
      const user = JSON.parse(loggedUser);
      setUser(user);
    }
  }, []);

  return (
    <div className="welcome-page">
      {user ? (
        <div className="welcome-card">
          <div className="profile-container">
            <div className="profile-image-container">
              <img
                src={profilephoto}
                alt="Foto de perfil"
                className="profile-picture"
              />
              <div className="profile-status"></div>
            </div>
            <div className="welcome-text">
              <span className="welcome-label">Bienvenido a INCLUSION</span>
              <h1 className="user-name">{user.name}</h1>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading">
          <p>Cargando...</p>
        </div>
      )}
    </div>
  );
};

export default Inicio;