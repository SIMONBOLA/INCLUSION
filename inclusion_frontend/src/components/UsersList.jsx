import { useState, useEffect } from 'react';
import userService from '../services/users';
import '../styles/components.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setCurrentUser(user);
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userData = await userService.getAll();
      setUsers(userData);
    } catch (error) {
      setError('Error al cargar la lista de usuarios');
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleDelete = async (userId, username) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${username}?`)) {
      try {
        await userService.deleteUser(userId);
        setMessage('Usuario eliminado exitosamente');
        setTimeout(() => setMessage(null), 4000);
        fetchUsers(); // Recargar la lista
      } catch (error) {
        setError('Error al eliminar el usuario');
        setTimeout(() => setError(null), 4000);
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'profesor':
        return 'role-badge profesor';
      case 'estudiante':
        return 'role-badge estudiante';
      default:
        return 'role-badge';
    }
  };

  return (
    <div className="users-list-container">
      <h2 className="register-title">Gestión de Usuarios</h2>
      
      {message && <div className="notification success">{message}</div>}
      {error && <div className="notification error">{error}</div>}

      <div className="table-container">
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
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </td>
                <td>{user.estudiante?.grupo || '-'}</td>
                <td>
                  {currentUser && user.username !== currentUser.username && (
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(user.id, user.username)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;