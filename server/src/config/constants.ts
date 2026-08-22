export const DEFAULT_CATEGORIES = [
  { name: 'Housing & Rent', icon: 'Home', color: '#6366F1' },
  { name: 'Groceries & Food', icon: 'ShoppingCart', color: '#10B981' },
  { name: 'Dining & Restaurants', icon: 'Utensils', color: '#F59E0B' },
  { name: 'Transportation', icon: 'Car', color: '#3B82F6' },
  { name: 'Utilities & Bills', icon: 'Zap', color: '#EC4899' },
  { name: 'Health & Fitness', icon: 'Activity', color: '#14B8A6' },
  { name: 'Entertainment & Leisure', icon: 'Film', color: '#8B5CF6' },
  { name: 'Shopping & Retail', icon: 'ShoppingBag', color: '#F97316' },
  { name: 'Subscriptions & Software', icon: 'Layers', color: '#06B6D4' },
  { name: 'Travel & Vacations', icon: 'Plane', color: '#3B82F6' },
  { name: 'Education & Learning', icon: 'BookOpen', color: '#84CC16' },
  { name: 'Miscellaneous', icon: 'MoreHorizontal', color: '#64748B' },
];

export const PAYMENT_METHODS = [
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
  'CRYPTO',
  'OTHER',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
];
