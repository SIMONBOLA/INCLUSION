import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from '../components/Menu';
import Inicio from '../pages/Inicio';
import Contactanos from '../pages/Contactanos';
import SobreNosotros from '../pages/SobreNosotros';
import LoginForm from '../components/Login';
import Notas from '../pages/Notas';
import Graficas from '../pages/Graficas';
import AnaliticasPage from '../pages/AnaliticasPage';
import GestionUsuarios from '../pages/GestionUsuarios';

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


        <Route path="/analiticas" element={
          isAuthenticated ? (
            <Layout>
              <AnaliticasPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/gestion-usuarios" element={
          isAuthenticated ? (
            (() => {
              const user = JSON.parse(localStorage.getItem('loggedUser'));
              return user?.role === 'admin' ? (
                <Layout>
                  <GestionUsuarios />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              );
            })()
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
};

export default Rutas;