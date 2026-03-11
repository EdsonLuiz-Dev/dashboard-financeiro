/**
 * Password hashing using Web Crypto API (SHA-256 + salt).
 * No external dependencies required.
 */

export async function generateSalt(): Promise<string> {
  const buffer = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
