/**
 * Componente SEO Multi-idioma
 * Agrega hreflang tags para SEO internacional
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEOMultiLang = ({ path = '' }) => {
  const { i18n } = useTranslation();
  const baseUrl = window.location.origin;
  const currentLang = i18n.language;

  // Idiomas soportados
  const languages = [
    { code: 'es', locale: 'es-CO' }, // Español Colombia
    { code: 'en', locale: 'en-US' }  // English US
  ];

  // Generar URLs alternativas
  const alternateUrls = languages.map(lang => ({
    lang: lang.code,
    locale: lang.locale,
    url: `${baseUrl}/${lang.code}${path}`
  }));

  // URL x-default (fallback)
  const defaultUrl = `${baseUrl}${path}`;

  return (
    <Helmet>
      {/* HTML lang attribute */}
      <html lang={currentLang} />

      {/* Hreflang tags */}
      {alternateUrls.map(({ lang, locale, url }) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={url}
        />
      ))}

      {/* X-default (fallback) */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={defaultUrl}
      />

      {/* Canonical URL (idioma actual) */}
      <link
        rel="canonical"
        href={`${baseUrl}/${currentLang}${path}`}
      />

      {/* Open Graph locale */}
      <meta property="og:locale" content={currentLang === 'es' ? 'es_CO' : 'en_US'} />
      {alternateUrls
        .filter(({ lang }) => lang !== currentLang)
        .map(({ lang, locale }) => (
          <meta
            key={lang}
            property="og:locale:alternate"
            content={locale.replace('-', '_')}
          />
        ))
      }
    </Helmet>
  );
};

export default SEOMultiLang;
