import { User } from '@prisma/client';
import { JwtPayload } from '~/utils/jwt';
import { Request } from 'express';

declare global {
  namespace Express {
    export interface Request {
      verifiedAccessToken?: string;
    }
  }
}
