function ensureEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Environment variable ${name} is not defined`);
    }
    return value;
  }
  
export function validateEnvVars() {
    ensureEnvVar('DATABASE_HOST');
    ensureEnvVar('DATABASE_PORT');
    ensureEnvVar('DATABASE_USERNAME');
    ensureEnvVar('DATABASE_PASSWORD');
    ensureEnvVar('DATABASE_NAME');
    ensureEnvVar('JWT_SECRET');
    ensureEnvVar('BASE_URL');
}