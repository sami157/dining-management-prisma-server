import type { UserRole } from '../../../../generated/prisma/enums';
import type { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        id: string;
        uid: string;
        email?: string;
        name?: string;
        picture?: string;
        role: UserRole;
        decodedToken: DecodedIdToken;
      };
    }
  }
}

export {};
