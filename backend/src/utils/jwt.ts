import jwt from 'jsonwebtoken';
import AuthError from '~/errors/auth-error';
import { strict as assert } from 'assert';
import type { User, Role as UserRole } from '@prisma/client';
import { TOKEN_AGES } from '~/utils/constants';

export type JwtPayload = jwt.JwtPayload &
  Pick<User, 'email' | 'username' | 'isVerified'> & {
    userId: string;
    role: UserRole;
    iat: number;
    exp: number;
  };

export default class JWT {
  static SECRET = process.env.JWT_SECRET;

  static sign<T extends object>(data: T) {
    assert(JWT.SECRET, 'You cannot sign a JWT without a secret key.');
    return jwt.sign(data, JWT.SECRET, {
      expiresIn: TOKEN_AGES.ACCESS_TOKEN
    });
  }

  static verify(token: string | undefined): JwtPayload {
    try {
      assert(JWT.SECRET, 'You cannot verify a JWT without a secret key.');
      if (!token) {
        throw new AuthError('Invalid token.');
      }

      const payload = jwt.verify(token, JWT.SECRET);

      if (
        typeof payload === 'object' &&
        payload !== null &&
        'userId' in payload &&
        'role' in payload
      ) {
        return payload as JwtPayload;
      }

      throw new Error(); // enter the catch clause
    } catch (error) {
      throw new AuthError('Invalid token.');
    }
  }

  static decode(token: string) {
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (!decoded) {
      throw new Error('Failed to decode token.');
    }
    return decoded;
  }

  static fromBearerToken(bearerToken: string) {
    const token = bearerToken.startsWith('Bearer ') ? bearerToken.split(' ')[1] : bearerToken;
    return JWT.decode(token) && token;
  }

  static toBearerToken(token: string) {
    return JWT.decode(token) && `Bearer ${token}`;
  }
}
