function isProductionEnv(): boolean {
  const nodeEnv = String(process.env.NODE_ENV || '').trim().toLowerCase();
  return nodeEnv === 'prod' || nodeEnv === 'production';
}

const parseAllowedCorsOrigins = (): string[] => {
  const raw = String(process.env.AAA_CORS_ALLOWED_ORIGINS || '').trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const isCorsOriginAllowed = (origin?: string): boolean => {
  const allowedOrigins = parseAllowedCorsOrigins();
  if (!origin) return true;
  if (allowedOrigins.includes('*')) return true;
  if (allowedOrigins.length === 0) {
    return !isProductionEnv();
  }
  return allowedOrigins.includes(origin);
};
