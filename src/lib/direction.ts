export type AppDirection = 'ltr' | 'rtl';

export const getDocumentDirection = (): AppDirection => {
  if (typeof document === 'undefined') return 'ltr';
  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
};
