export default function validateEnvVariable(name: string): string {
  const value = process.env[name];

  if (value == null) {
    throw new Error(`Environment ${name} variable wasn't defined`);
  }

  return value;
}
