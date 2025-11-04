import { useState, useEffect } from 'react'
import Register from '../components/Register'
import ExcelUpload from '../components/ExcelUpload'
import userService from '../services/users'
import '../styles/GestionUsuarios.css'

const GestionUsuarios = () => {
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [showUsersList, setShowUsersList] = useState(false)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [currentUser, setCurrentUser] = useState(null);
  const userStorage = JSON.parse(localStorage.getItem('user')) // Suponiendo que el usuario logueado está en el localStorage

  // Efecto para limpiar el mensaje de error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (showUsersList) {
      fetchUsers()
    }
  }, [showUsersList])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setCurrentUser(user);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const userData = await userService.getAll()
      setUsers(userData)
    } catch (err) {
      setMessage({ type: 'messageerror', message: 'Error al cargar la lista de usuarios' })
      setTimeout(() => setMessage(null), 4000)
    }
  }

  return (
    <div className="gestion-usuarios-container">
      <h2>Gestión de Usuarios</h2>
      
      {!showRegisterForm && !showUsersList ? (
        <div className="gestion-usuarios-actions">
          <button 
            className="btn-crear-usuario"
            onClick={() => setShowRegisterForm(true)}
          >
            Crear Nuevo Usuario
          </button>
          <button 
            className="btn-ver-usuarios"
            onClick={() => setShowUsersList(true)}
          >
            Ver Lista de Usuarios
          </button>
          <ExcelUpload onUploadComplete={(success) => {
            if (success) {
              setMessage({ type: 'messagesuccess', message: 'Usuarios importados exitosamente' });
            } else {
              setMessage({ type: 'messageerror', message: 'Error al importar usuarios' });
            }
            setTimeout(() => setMessage(null), 4000);
            fetchUsers();
            setShowUsersList(true);
          }} />
        </div>
      ) : showRegisterForm ? (
        <div className="register-container">
          <button 
            className="btn-volver"
            onClick={() => setShowRegisterForm(false)}
          >
            ← Volver
          </button>
          <Register onRegisterSuccess={() => {
            setShowRegisterForm(false)
            fetchUsers()
          }} />
        </div>
      ) : (
        <div className="users-list-container">
          <button 
            className="btn-volver"
            onClick={() => setShowUsersList(false)}
          >
            ← Volver
          </button>
          {message && (
            <div className={message.type}>
              {message.message}
            </div>
          )}
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Grupo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.nombre}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.estudiante ? user.estudiante.grupo : '-'}</td>
                  <td>
                    {currentUser && user.username !== currentUser.username && (
                      <button 
                        className="btn-eliminar"
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.nombre}?`)) {
                            userService.deleteUser(user.id)
                              .then(() => {
                                setMessage({ type: 'messagesuccess', message: 'Usuario eliminado exitosamente' });
                                fetchUsers();
                                const timer = setTimeout(() => {
                                  setMessage(null);
                                }, 4000);
                                return () => clearTimeout(timer);
                              })
                              .catch((error) => {
                                console.error('Error:', error);
                                setError({ type: 'error', message: 'Error al eliminar el usuario' });
                                const timer = setTimeout(() => {
                                  setError(null);
                                }, 4000);
                                return () => clearTimeout(timer);
                              });
                          }
                        }}
                      >
                        <i className="fas fa-trash"></i> Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default GestionUsuarios