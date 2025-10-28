import Menu from '../components/Menu';
import '../styles/SobreNosotros.css';

const SobreNosotros = () => {
  return (
    <div className="sobre-nosotros-page">
      <header className="sobre-nosotros-header">
        <h1>Sobre Inclusión</h1>
        <p className="header-description">
          <em>Uniendo corazones, conectando futuros: tu espacio digital para una educación más humana.</em>
        </p>
      </header>

      <main className="sobre-nosotros-main">
        <section className="sobre-nosotros-introduccion">
          <h2>Nuestra Historia</h2>
          <p>
            Inclusión nació de la visión compartida de tres estudiantes apasionados por la educación:
            Eddy Rodríguez Molina, Simón Bolaños Pisos y Phillip Fernández Rivera. Juntos, 
            creamos este espacio digital con la firme convicción de que la tecnología debe ser 
            un puente que une, no una barrera que separa.
          </p>
        </section>

        <section className="sobre-nosotros-mision">
          <h2>Nuestra Misión</h2>
          <p>
            Buscamos fortalecer los lazos entre profesores, padres de familia y estudiantes a través 
            de una plataforma que hace de la comunicación educativa una experiencia natural y enriquecedora. 
            Creemos en el poder de la conexión humana y en cómo ésta puede transformar la manera 
            en que aprendemos y crecemos juntos.
          </p>
        </section>

        <section className="sobre-nosotros-valores">
          <h2>Nuestros Valores</h2>
          <ul>
            <li><strong>Comunidad:</strong> Creemos en el poder de la unión y el apoyo mutuo</li>
            <li><strong>Empatía:</strong> Entendemos y valoramos las necesidades de cada miembro</li>
            <li><strong>Innovación:</strong> Utilizamos la tecnología para acercar personas</li>
            <li><strong>Compromiso:</strong> Trabajamos por una educación más inclusiva y efectiva</li>
          </ul>
        </section>

        <section className="sobre-nosotros-equipo">
          <h2>Nuestro Equipo</h2>
          <div className="equipo-grid">
            <div className="equipo-card">
              <h3>Eddy Rodríguez Molina</h3>
              <p>Desarrollador Principal</p>
            </div>
            <div className="equipo-card">
              <h3>Simón Bolaños Pisos</h3>
              <p>Arquitecto de Software</p>
            </div>
            <div className="equipo-card">
              <h3>Phillip Fernández Rivera</h3>
              <p>Diseñador de Experiencia</p>
            </div>
          </div>
        </section>

        <section className="sobre-nosotros-vision">
          <h2>Nuestra Visión de Futuro</h2>
          <p>
            Aspiramos a crear un mundo donde la distancia física no sea un obstáculo para la 
            conexión educativa. Donde cada estudiante se sienta apoyado, cada profesor empoderado 
            y cada padre involucrado. Inclusión es más que una herramienta: es una comunidad 
            digital que impulsa el crecimiento, la empatía y la educación colaborativa.
          </p>
          <p className="vision-quote">
            <em>"Construyendo puentes digitales para una educación sin barreras."</em>
          </p>
        </section>

        <section className="sobre-nosotros-contacto">
          <h2>Conéctate con Nosotros</h2>
          <p>
            Ser parte de Inclusión significa ser parte de una comunidad comprometida con 
            la excelencia educativa. ¿Tienes preguntas o sugerencias? Nos encantaría escucharte.
          </p>
          <div className="contacto-info">
            <a href="mailto:contacto@inclusion.edu" className="contacto-link">
              contacto@inclusion.edu
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SobreNosotros;