// src/utils/analytics.ts

type EventProperties = Record<string, any>;

/**
 * Track analytics events
 * @param eventName - The name of the event to track
 * @param properties - Optional properties to include with the event
 */
export const trackEvent = (eventName: string, properties?: EventProperties): void => {
  // In production, replace this with your actual analytics implementation
  // Examples: Google Analytics, Mixpanel, Segment, Amplitude, etc.
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties);
  }

  // Example Google Analytics 4 implementation:
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', eventName, properties);
  // }

  // Example Mixpanel implementation:
  // if (typeof window !== 'undefined' && window.mixpanel) {
  //   window.mixpanel.track(eventName, properties);
  // }

  // Example custom analytics endpoint:
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ event: eventName, properties, timestamp: new Date().toISOString() })
  // }).catch(console.error);
};

/**
 * Track page views
 * @param pageName - The name or path of the page
 */
export const trackPageView = (pageName: string): void => {
  trackEvent('page_view', { page: pageName });
};

/**
 * Track user actions
 * @param action - The action performed
 * @param category - The category of the action
 * @param label - Optional label for the action
 * @param value - Optional numeric value
 */
export const trackAction = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  trackEvent('user_action', {
    action,
    category,
    label,
    value,
  });
};