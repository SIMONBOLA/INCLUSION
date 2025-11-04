import React, { useState } from 'react';
import userService from '../services/users';
import '../styles/ExcelUpload.css';

const ExcelUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [showExample, setShowExample] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls'].includes(fileExtension)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Por favor, seleccione un archivo Excel válido (.xlsx, .xls)');
        setFile(null);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, seleccione un archivo Excel');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Enviando archivo:', file.name);
      const response = await userService.uploadBulkUsers(formData);
      console.log('Respuesta del servidor:', response);
      if (response && response.resultados) {
        setUploadResults(response.resultados);
        if (onUploadComplete) {
          // Pasamos true si no hay errores, false si los hay
          onUploadComplete(response.resultados.errores === 0);
        }
      } else {
        setError('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError(err.response?.data?.error || 'Error al cargar el archivo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="excel-upload-container">
      <h3>Carga Masiva de Usuarios y Notas</h3>
      <div className="info-section">
        <button 
          onClick={() => setShowExample(!showExample)}
          className="info-button"
        >
          {showExample ? 'Ocultar Ejemplo' : 'Ver Ejemplo de Estructura'}
        </button>
        {showExample && (
          <div className="example-content">
            <h4>Estructura del archivo Excel:</h4>
            <p>El archivo debe contener las siguientes columnas:</p>
            <ul>
              <li><strong>username</strong>: Nombre de usuario</li>
              <li><strong>password</strong>: Contraseña</li>
              <li><strong>role</strong>: Rol (estudiante, profesor, admin)</li>
              <li><strong>nombre</strong>: Nombre del usuario</li>
              <li><strong>apellido</strong>: Apellido del usuario</li>
              <li><strong>email</strong>: Correo electrónico</li>
              <li><strong>grupo</strong>: Grupo (solo para estudiantes)</li>
              <li><strong>materias</strong>: JSON con las materias y notas (solo para estudiantes)</li>
            </ul>
            <h4>Ejemplo de columna materias:</h4>
            <pre>
            {JSON.stringify([
              {
                "nombre": "Matemáticas",
                "calificacion": 4.5,
                "observacion": "Buen desempeño",
                "periodo": "2023-1"
              }
            ], null, 2)}
            </pre>
          </div>
        )}
      </div>
      <div className="upload-section">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".xlsx,.xls"
          className="file-input"
          id="excel-file"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`upload-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Procesando...' : 'Subir Archivo'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {uploadResults && (
        <div className={`upload-results ${uploadResults.errores === 0 ? 'success' : 'warning'}`}>
          <h4>Resultados de la carga</h4>
          <div className="results-summary">
            <div className="success-count">
              <i className="fas fa-check-circle"></i>
              <span>Usuarios creados exitosamente: {uploadResults.exitosos}</span>
            </div>
            <div className="error-count">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Errores encontrados: {uploadResults.errores}</span>
            </div>
          </div>
          
          {uploadResults.detalles.success.length > 0 && (
            <div className="success-details">
              <h5>Usuarios creados:</h5>
              <ul>
                {uploadResults.detalles.success.map((user, index) => (
                  <li key={index} className="success-item">
                    <i className="fas fa-user"></i>
                    {user.username} - {user.role}
                    {user.grupo && ` (Grupo: ${user.grupo})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {uploadResults.detalles.errors.length > 0 && (
            <div className="error-details">
              <h5>Detalles de errores:</h5>
              <ul>
                {uploadResults.detalles.errors.map((error, index) => (
                  <li key={index} className="error-item">
                    <i className="fas fa-exclamation-circle"></i>
                    <strong>{error.username}</strong>: {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;