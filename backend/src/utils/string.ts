import crypto from 'crypto';

type ValidAlgorithms = 'sha256' | 'sha512';

export function hash(token: string, algorithm: ValidAlgorithms) {
  const hash = crypto.createHash(algorithm);
  hash.update(token);
  return hash.digest('hex');
}

export function generateRandomKey() {
  return hash(crypto.randomBytes(24).toString('base64url'), 'sha256');
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-');
}
