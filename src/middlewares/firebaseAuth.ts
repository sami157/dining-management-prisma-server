import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { firebaseAuth } from '../lib/firebaseAdmin';
import { prisma } from '../lib/prisma';
import { UserRole } from '../../generated/prisma/enums';

const firebaseAuthMiddleware = (...allowedRoles: UserRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header is required');
      }

      const [scheme, token] = authorizationHeader.split(' ');

      if (scheme !== 'Bearer' || !token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'Authorization header must be in the format: Bearer <token>',
        );
      }

      const decodedToken = await firebaseAuth.verifyIdToken(token);
      const appUser = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (!appUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User is not registered in the system');
      }

      if (!appUser.isActive) {
        throw new ApiError(httpStatus.FORBIDDEN, 'User account is inactive');
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(appUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to access this resource');
      }

      req.firebaseUser = {
        id: appUser.id,
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        role: appUser.role,
        decodedToken,
      };

      next();
    } catch (error) {
      next(
        error instanceof ApiError
          ? error
          : new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired Firebase token'),
      );
    }
  };
};

export default firebaseAuthMiddleware;
