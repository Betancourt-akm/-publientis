import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Componente SEO reutilizable para metadatos dinámicos por página.
 *
 * Permite que cada ruta (Inicio, Ofertas, Perfil, etc.) defina su propio
 * título, descripción y keywords. Diseñado para escalar a múltiples
 * universidades: cada institución podrá inyectar sus propios valores.
 *
 * @param {string} title       - Título de la página (se concatena con el sufijo base).
 * @param {string} description - Meta description de la página.
 * @param {string} keywords    - Palabras clave separadas por coma.
 * @param {string} url         - URL canónica de la página.
 * @param {string} image       - URL absoluta de la imagen para Open Graph.
 */

const SITE_NAME = 'Publientis';
const DEFAULT_TITLE = 'Publientis | Vinculación Profesional Universitaria';
const DEFAULT_DESCRIPTION =
  'Plataforma de vinculación profesional que conecta practicantes y egresados de la Facultad de Educación de la Universidad de Antioquia con el sector educativo y empresarial.';
const DEFAULT_KEYWORDS =
  'prácticas pedagógicas UdeA, vinculación laboral egresados educación, bolsa de empleo docentes Antioquia, red social académica, portafolio profesional universitario';
const DEFAULT_IMAGE = 'https://publientis.online/logo512.png';
const BASE_URL = 'https://publientis.online';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  url = BASE_URL,
  image = DEFAULT_IMAGE,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_CO" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
