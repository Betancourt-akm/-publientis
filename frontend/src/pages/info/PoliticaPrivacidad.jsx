// src/pages/PoliticaPrivacidad.jsx
import React from 'react';
import './PoliticaPrivacidad.css';

const PoliticaPrivacidad = () => {
  return (
    <main className="pp-container">
      <h1 className="pp-title">Política de Privacidad</h1>

      <section className="pp-section">
        <h2>1. Introducción</h2>
        <p>
          En <strong>MaestroMatch</strong> nos comprometemos a proteger tu privacidad.
          Esta política explica qué datos recopilamos, cómo los usamos y qué
          derechos tienes sobre tu información.
        </p>
      </section>

      <section className="pp-section">
        <h2>2. Datos que Recopilamos</h2>
        <ul>
          <li><strong>Información de contacto:</strong> nombre, email, teléfono.</li>
          <li><strong>Datos de uso:</strong> búsquedas, páginas visitadas, tiempo en la plataforma.</li>
          <li><strong>Archivo de perfil:</strong> foto, descripción, rol (alumno/profesor).</li>
        </ul>
      </section>

      <section className="pp-section">
        <h2>3. ¿Para Qué Usamos Tus Datos?</h2>
        <ul>
          <li>Crear y gestionar tu cuenta en MaestroMatch.</li>
          <li>Emparejarte con profesores o alumnos según tu rol.</li>
          <li>Mejorar nuestra plataforma y personalizar tu experiencia.</li>
          <li>Enviarte notificaciones y novedades relevantes.</li>
        </ul>
      </section>

      <section className="pp-section">
        <h2>4. Cookies y Tecnologías Similares</h2>
        <p>
          Utilizamos cookies propias y de terceros para facilitar tu navegación,
          recordar tus preferencias y analizar el uso del sitio. Puedes gestionar
          o desactivar cookies desde la configuración de tu navegador.
        </p>
      </section>

      <section className="pp-section">
        <h2>5. Compartir Información</h2>
        <p>
          No vendemos tus datos. Podemos compartirlos con:
        </p>
        <ul>
          <li>Proveedores de servicios (hosting, email, análisis).</li>
          <li>Autoridades si es requerido por ley.</li>
        </ul>
      </section>

      <section className="pp-section">
        <h2>6. Tus Derechos</h2>
        <p>
          Tienes derecho a:
        </p>
        <ul>
          <li>Acceder, rectificar o borrar tus datos.</li>
          <li>Limitar u oponerte a su tratamiento.</li>
          <li>Solicitar la portabilidad de tu información.</li>
        </ul>
        <p>
          Para ejercerlos, escríbenos a{' '}
          <a href="mailto:privacidad@maestromatch.com" className="pp-link">
            privacidad@maestromatch.com
          </a>.
        </p>
      </section>

      <section className="pp-section">
        <h2>7. Cambios en Esta Política</h2>
        <p>
          Podemos actualizar esta política ocasionalmente. Publicaremos la versión
          revisada con la fecha de última actualización al inicio de la página.
        </p>
      </section>

      <footer className="pp-footer">
        <p>Última actualización: 10 de Julio de 2025</p>
      </footer>
    </main>
  );
};

export default PoliticaPrivacidad;
