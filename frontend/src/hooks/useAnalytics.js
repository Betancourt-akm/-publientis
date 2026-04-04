/**
 * Hook de React para Analytics
 * Facilita el tracking en componentes
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics';

/**
 * Hook para track automático de page views
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search);
  }, [location]);
};

/**
 * Hook con funciones de tracking
 */
export const useAnalytics = () => {
  return {
    // Page tracking
    trackPage: (path, title) => analytics.trackPageView(path, title),
    trackEvent: (eventName, params) => analytics.trackEvent(eventName, params),
    
    // E-commerce
    trackViewItemList: (items, listName) => analytics.trackViewItemList(items, listName),
    trackViewItem: (product) => analytics.trackViewItem(product),
    trackAddToCart: (product, quantity) => analytics.trackAddToCart(product, quantity),
    trackRemoveFromCart: (product, quantity) => analytics.trackRemoveFromCart(product, quantity),
    trackViewCart: (items, total) => analytics.trackViewCart(items, total),
    trackBeginCheckout: (items, total) => analytics.trackBeginCheckout(items, total),
    trackPurchase: (order) => analytics.trackPurchase(order),
    trackSearch: (term, count) => analytics.trackSearch(term, count),
    trackSelectItem: (product, listName, index) => analytics.trackSelectItem(product, listName, index),
    
    // User
    identifyUser: (user) => analytics.identifyUser(user),
    
    // Conversions
    trackConversion: (goalName, value) => analytics.trackConversionGoal(goalName, value),
    
    // Custom events
    trackProductClick: (product) => {
      analytics.trackEvent('product_click', {
        product_id: product._id,
        product_name: product.name,
        product_category: product.category
      });
    },
    
    trackCategoryView: (category) => {
      analytics.trackEvent('category_view', {
        category_name: category
      });
    },
    
    trackFilterUse: (filterType, filterValue) => {
      analytics.trackEvent('filter_use', {
        filter_type: filterType,
        filter_value: filterValue
      });
    },
    
    trackNewsletterSignup: (email) => {
      analytics.trackEvent('newsletter_signup', {
        email: email
      });
      analytics.triggerHotjarEvent('newsletter_signup');
    },
    
    trackSocialShare: (platform, itemType, itemId) => {
      analytics.trackEvent('share', {
        method: platform,
        content_type: itemType,
        item_id: itemId
      });
    },
    
    trackReviewSubmit: (productId, rating) => {
      analytics.trackEvent('review_submit', {
        product_id: productId,
        rating: rating
      });
      analytics.triggerHotjarEvent('review_submit');
    },
    
    trackWishlistAdd: (productId) => {
      analytics.trackEvent('add_to_wishlist', {
        product_id: productId
      });
    },
    
    trackCouponApply: (couponCode, success) => {
      analytics.trackEvent('coupon_apply', {
        coupon_code: couponCode,
        success: success
      });
    }
  };
};

export default useAnalytics;
