import { AI_FEATURE_REGISTRY } from '@/ai/featureRegistry';

export const aiOpsService = {
  getSystemHealth() {
    return {
      latency: '420ms',
      safetyBlocks: 12,
      successRate: '99.2%',
      tokenUsage: '14.2k'
    };
  },
  
  getFeatureStatus() {
    return AI_FEATURE_REGISTRY;
  },

  getRecentInterventions() {
    return [
      { id: 1, type: 'Safety Scan', action: 'Blocked Message', time: '10m ago' },
      { id: 2, type: 'Bio Coach', action: 'Filtered PII', time: '1h ago' },
      { id: 3, type: 'Taste Profile', action: 'Reset by User', time: '2h ago' }
    ];
  }
};
