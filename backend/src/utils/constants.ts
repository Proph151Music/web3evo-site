export const TOKEN_AGES = {
  ACCESS_TOKEN: 15 * 60 * 1000, // 15 minutes
  RESET_TOKEN: 15 * 60 * 1000, // 15 mninutes
  VERIFICATION_TOKEN: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN: 30 * 24 * 60 * 60 * 1000 // 1 month
} as const;
