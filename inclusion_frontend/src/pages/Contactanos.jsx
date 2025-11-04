import { useState } from 'react';
import contactService from '../services/contact';
import '../styles/Contactanos.css';

const Contactanos = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: '', message: '' });

      // Validaciones
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setSubmitStatus({
          type: 'error',
          message: 'Por favor, complete todos los campos'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setSubmitStatus({
          type: 'error',
          message: 'Por favor, ingrese un correo electrónico válido'
        });
        return;
      }

      // Enviar mensaje usando el servicio
      await contactService.sendContactMessage({
        nombre: formData.name,
        email: formData.email,
        mensaje: formData.message
      });

      // Limpiar el formulario
      setFormData({
        name: '',
        email: '',
        message: ''
      });

      // Mostrar mensaje de éxito
      setSubmitStatus({
        type: 'success',
        message: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.'
      });

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Hubo un error al enviar el mensaje. Por favor, intente nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contactanos-container">
      <div className="contacto-info">
        <div className="info-card">
          <div className="icon-container">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <h3>NUESTRA OFICINA PRINCIPAL</h3>
          <p>INSTITUTO COMERCIAL, INDUSTRIAL Y TECNOLOGICO "I.C.I.T"</p>
        </div>

        <div className="info-card">
          <div className="icon-container">
            <i className="fas fa-phone"></i>
          </div>
          <h3>NÚMERO DE TELÉFONO</h3>
          <p>+57 322/4967/203</p>
          <p className="note">(llamada gratuita)</p>
        </div>

        <div className="info-card">
          <div className="icon-container">
            <i className="fas fa-envelope"></i>
          </div>
          <h3>CORREO ELECTRÓNICO</h3>
          <p>Inclusion@gmail.com</p>
        </div>
      </div>

      <div className="contact-form">
        <h2>Contáctenos</h2>
        {submitStatus.message && (
          <div className={`status-message ${submitStatus.type}`}>
            {submitStatus.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Ingrese su Nombre"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Ingrese un correo electrónico válido"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="message"
              placeholder="Escriba su mensaje aquí"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'ENVIANDO...' : 'ENVIAR'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contactanos;