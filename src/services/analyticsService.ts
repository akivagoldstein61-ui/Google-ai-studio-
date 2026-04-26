import { AnalyticsEvent } from '../types';

export const analytics = {
  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    console.log(`[Analytics] ${event}`, properties || '');
    // In production, this would send to a real analytics provider
  }
};
