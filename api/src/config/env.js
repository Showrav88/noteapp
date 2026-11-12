const required = ['MONGODB_URI', 'JWT_SECRET'];

export function assertRequiredEnv() {
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}
