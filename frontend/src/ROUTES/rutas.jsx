import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from '../components/Menu';
import Inicio from '../pages/Inicio';
import Contactanos from '../pages/Contactanos';
import SobreNosotros from '../pages/SobreNosotros';
import LoginForm from '../components/Login';
import Notas from '../pages/Notas';
import Graficas from '../pages/Graficas';
import Comentarios from '../pages/Comentarios';

const Layout = ({ children }) => {
  return (
    <div className="app-wrapper">
      <Menu />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const Rutas = () => {
  const isAuthenticated = window.localStorage.getItem('loggedUser');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? (
            <LoginForm />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/" element={
          isAuthenticated ? (
            <Layout>
              <Inicio />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/contactanos" element={
          isAuthenticated ? (
            <Layout>
              <Contactanos />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/sobre-nosotros" element={
          isAuthenticated ? (
            <Layout>
              <SobreNosotros />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/notas" element={
          isAuthenticated ? (
            <Layout>
              <Notas />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/graficas" element={
          isAuthenticated ? (
            <Layout>
              <Graficas />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/comentarios" element={
          isAuthenticated ? (
            <Layout>
              <Comentarios />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
};

export default Rutas;