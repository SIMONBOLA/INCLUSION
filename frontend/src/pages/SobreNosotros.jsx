import Menu from '../components/Menu';

const SobreNosotros = () => {
  return (
    <div className="sobre-nosotros-page">
    
      <header className="sobre-nosotros-header">
        <h1>Sobre Nosotros</h1>
        <p>
          Somos una empresa dedicada a ofrecer soluciones innovadoras para nuestros clientes, 
          ayudándolos a alcanzar sus objetivos con tecnología de vanguardia.
        </p>
      </header>

      <main className="sobre-nosotros-main">
        {/* Sección de misión */}
        <section className="sobre-nosotros-mision">
          <h2>Nuestra Misión</h2>
          <p>
            Brindar soluciones tecnológicas que impulsen el crecimiento y la eficiencia de nuestros clientes, 
            mientras fomentamos un entorno de innovación y excelencia.
          </p>
        </section>

        {/* Sección de visión */}
        <section className="sobre-nosotros-vision">
          <h2>Nuestra Visión</h2>
          <p>
            Ser líderes en el desarrollo de soluciones tecnológicas, reconocidos por nuestra calidad, 
            compromiso y capacidad de transformar ideas en realidades.
          </p>
        </section>

        {/* Sección de valores */}
        <section className="sobre-nosotros-valores">
          <h2>Nuestros Valores</h2>
          <ul>
            <li><strong>Innovación:</strong> Siempre buscamos nuevas formas de resolver problemas.</li>
            <li><strong>Compromiso:</strong> Estamos dedicados al éxito de nuestros clientes.</li>
            <li><strong>Excelencia:</strong> Nos esforzamos por ofrecer la mejor calidad en todo lo que hacemos.</li>
            <li><strong>Integridad:</strong> Actuamos con honestidad y transparencia.</li>
          </ul>
        </section>

        {/* Sección de equipo */}
        <section className="sobre-nosotros-equipo">
          <h2>Conoce a Nuestro Equipo</h2>
          <div className="equipo-grid">
            <div className="equipo-card">
              <img src="team-member1.jpg" alt="Miembro del equipo" className="equipo-imagen" />
              <h3>Juan Pérez</h3>
              <p>CEO y Fundador</p>
            </div>
            <div className="equipo-card">
              <img src="team-member2.jpg" alt="Miembro del equipo" className="equipo-imagen" />
              <h3>María López</h3>
              <p>Directora de Tecnología</p>
            </div>
            <div className="equipo-card">
              <img src="team-member3.jpg" alt="Miembro del equipo" className="equipo-imagen" />
              <h3>Carlos García</h3>
              <p>Gerente de Proyectos</p>
            </div>
          </div>
        </section>

        {/* Sección de contacto */}
        <section className="sobre-nosotros-contacto">
          <h2>Contáctanos</h2>
          <p>
            Si deseas saber más sobre nosotros o nuestros servicios, no dudes en ponerte en contacto.
          </p>
          <ul>
            <li><strong>Email:</strong> contacto@nuestraempresa.com</li>
            <li><strong>Teléfono:</strong> +1 234 567 890</li>
            <li><strong>Dirección:</strong> Calle Falsa 123, Ciudad, País</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default SobreNosotros;