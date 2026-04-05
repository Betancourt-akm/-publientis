/**
 * Hook para SEO
 * Facilita la gestión de meta tags y schema markup
 */

import { useState, useEffect } from 'react';

const useSEO = () => {
  /**
   * Obtener meta tags de producto
   */
  const getProductMeta = async (productId) => {
    try {
      const response = await fetch(`/api/seo/meta/product/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.meta;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product meta:', error);
      return null;
    }
  };

  /**
   * Obtener meta tags de categoría
   */
  const getCategoryMeta = async (category) => {
    try {
      const response = await fetch(`/api/seo/meta/category/${encodeURIComponent(category)}`);
      const data = await response.json();
      
      if (data.success) {
        return data.meta;
      }
      return null;
    } catch (error) {
      console.error('Error fetching category meta:', error);
      return null;
    }
  };

  /**
   * Obtener meta tags por defecto
   */
  const getDefaultMeta = async (page = 'home') => {
    try {
      const response = await fetch(`/api/seo/meta/${page}`);
      const data = await response.json();
      
      if (data.success) {
        return data.meta;
      }
      return null;
    } catch (error) {
      console.error('Error fetching default meta:', error);
      return null;
    }
  };

  /**
   * Generar breadcrumb schema
   */
  const generateBreadcrumbSchema = (breadcrumbs) => {
    const baseUrl = window.location.origin;

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${baseUrl}${crumb.url}`
      }))
    };
  };

  /**
   * Generar product schema (local)
   */
  const generateProductSchema = (product) => {
    const baseUrl = window.location.origin;
    const productUrl = `${baseUrl}/producto/${product._id}`;

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images || [],
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Publientis'
      },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'COP',
        price: product.price,
        availability: product.stock > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Publientis'
        }
      },
      aggregateRating: product.rating && product.reviewCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1
      } : undefined
    };
  };

  /**
   * Generar review schema
   */
  const generateReviewSchema = (product, reviews) => {
    if (!reviews || reviews.length === 0) return null;

    return reviews.map(review => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': 'Product',
        name: product.name
      },
      author: {
        '@type': 'Person',
        name: review.userName
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      },
      reviewBody: review.comment,
      datePublished: review.createdAt
    }));
  };

  return {
    getProductMeta,
    getCategoryMeta,
    getDefaultMeta,
    generateBreadcrumbSchema,
    generateProductSchema,
    generateReviewSchema
  };
};

export default useSEO;
